from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import DateTime, Integer, func, desc, case
from db.conexion_db import get_db
from db.models import Proyecto, Inversion, Usuario
from config_token.authenticate import check_emprendedor

router = APIRouter(tags=["Projects"])

# ----------- Pydantic Schemas -----------
from pydantic import BaseModel
from decimal import Decimal
from datetime import date

class ProyectoCreate(BaseModel):
    empresa_id: int
    nombre_proyecto: str
    descripcion: str
    descripcion_extendida: str
    monto_pedido: Decimal
    sector: str  # sector de la empresa
    retorno_estimado: Decimal  # porcentaje
    fecha_inicio: date
    fecha_fin: date
    ubicacion: str  # ubicación de la empresa

@router.get("/get-proyectos")
def obtener_all_proyectos(limit: Optional[int] = None, db: Session = Depends(get_db)):
    
    list_proyecto = []
    
    if limit:
        proyectos = db.query(Proyecto).order_by(desc(Proyecto.retorno_estimado)).limit(limit).all()
    else:
        proyectos = db.query(Proyecto).order_by(desc(Proyecto.retorno_estimado)).all()

    for proyecto in proyectos:
        inversores = db.query(func.count(func.distinct(Inversion.inversor_id))) \
                        .filter(Inversion.proyecto_id == proyecto.id).scalar() or 0
        
        proyecto_dict = {
            "id": proyecto.id,
            "categoria": proyecto.sector,
            "titulo": proyecto.nombre_proyecto.capitalize(),
            "descripcion": proyecto.descripcion.capitalize(),
            "meta": proyecto.monto_pedido,
            "recaudado": proyecto.monto_recaudado,
            "rentabilidad": proyecto.retorno_estimado,
            "inversores": inversores
        }

        list_proyecto.append(proyecto_dict)

    return list_proyecto


@router.get("/{proyecto_id}")
def obtener_proyecto_detail(proyecto_id: int, db: Session = Depends(get_db)):
    
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    
    if not proyecto:
        raise HTTPException(
            status_code=404, 
            detail="Proyecto no encontrado"
        )

    emprendedor = db.query(Usuario).filter(Usuario.id == proyecto.emprendedor_id).first()
    categoria = proyecto.sector.capitalize() if emprendedor else "Desconocido"
    
    fecha_inicio = proyecto.fecha_inicio.strftime("%d/%m/%Y") if proyecto.fecha_inicio else None
    fecha_fin = proyecto.fecha_fin.strftime("%d/%m/%Y") if proyecto.fecha_fin else None

    porcentaje_reacudado = (int) (
        (proyecto.monto_recaudado or Decimal('0.00')) / 
        (proyecto.monto_pedido or Decimal('1.00')) * 100
    )
    estado = proyecto.estado
    inversores = db.query(func.count(func.distinct(Inversion.inversor_id))) \
                    .filter(Inversion.proyecto_id == proyecto.id).scalar() or 0

    return {
        "emprendedor": emprendedor.nombre.capitalize() + " " + emprendedor.apellido_paterno.capitalize(),
        "emprendedor_id": proyecto.emprendedor_id,
        "id": proyecto.id,
        "categoria": categoria,
        "titulo": proyecto.nombre_proyecto.capitalize(),
        "descripcion": proyecto.descripcion.capitalize(),
        "descripcion_extendida": proyecto.descripcion_extendida.capitalize(),
        "monto_requerido": (proyecto.monto_pedido or Decimal('0.00')).quantize(Decimal('0.01')),
        "monto_recaudado": (proyecto.monto_recaudado or Decimal('0.00')).quantize(Decimal('0.01')),
        "porcentaje": porcentaje_reacudado,
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "inversores": inversores,
        "estado": estado.capitalize()
    }
    
@router.get("/inversores/{proyecto_id}")
def obtener_inversores_proyecto(proyecto_id: int, db: Session = Depends(get_db)):

    inversores = []

    result = db.query(
        Usuario.nombre,
        Usuario.apellido_paterno,
        (func.extract('epoch', func.now() - Inversion.fecha_inversion)).label('diferencia'),
        case(
            (func.extract('epoch', func.now() - Inversion.fecha_inversion) < 3600, '0 horas desde inversión'),
            (func.extract('epoch', func.now() - Inversion.fecha_inversion) < 86400, (func.extract('epoch', func.now() - Inversion.fecha_inversion) / 3600.0).cast(Integer).concat(' horas desde inversión')),  # Less than 1 day -> hours
            (func.extract('epoch', func.now() - Inversion.fecha_inversion) < 604800, (func.extract('epoch', func.now() - Inversion.fecha_inversion) / 86400.0).cast(Integer).concat(' días desde inversión')), # Less than 1 week -> days
            (func.extract('epoch', func.now() - Inversion.fecha_inversion) < 2592000, (func.extract('epoch', func.now() - Inversion.fecha_inversion) / 604800.0).cast(Integer).concat(' semanas desde inversión')), # Less than 1 month (approx 30 days) -> weeks
            (func.extract('epoch', func.now() - Inversion.fecha_inversion) < 31536000, (func.extract('epoch', func.now() - Inversion.fecha_inversion) / 2592000.0).cast(Integer).concat(' meses desde inversión')), # Less than 1 year (approx 365 days) -> months
            else_=(func.extract('epoch', func.now() - Inversion.fecha_inversion) / 31536000.0).cast(Integer).concat(' años desde inversión') # More than 1 year -> years
        ).label('tiempo_desde_inversión')
    ).join(Usuario, Inversion.inversor_id == Usuario.id).filter(Inversion.proyecto_id == proyecto_id).all()

    if not result:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    for row in result:
        found = False
        
        for inversor in inversores:
            if row[0] == inversor["nombre"]:
                found = True
                if inversor["diferencia"] > row[2]:
                    inversor["diferencia"] = row[2]
                    inversor["tiempo_desde_inversion"] = row[3]
                break
        
        if not found:
            result_dict = {
                "nombre": row[0],
                "apellido": row[1],
                "diferencia": row[2],
                "tiempo_desde_inversion": row[3]
            }
            inversores.append(result_dict)
    
    return inversores


@router.get("/emprendedor/{emprendedor_id}")
def obtener_proyectos_emprendedor(emprendedor_id: int, db: Session = Depends(get_db)):

    proyectos_emprendedor = []

    proyectos = db.query(Proyecto).filter(Proyecto.emprendedor_id==emprendedor_id).all()

    if not proyectos:
        raise HTTPException(status_code=404, detail="Proyectos no encontrados")
    
    for proyecto in proyectos:
        # Calcular la diferencia entre fecha_inicio y fecha_fin
        diferencia_segundos = func.extract('epoch', proyecto.fecha_fin - func.now())
        diferencia_segundos_total = func.extract('epoch', proyecto.fecha_fin - proyecto.fecha_inicio)

        tiempo_diferencia_valor = case(
            (diferencia_segundos < 60, 0),
            (diferencia_segundos < 3600, 
             (func.cast(diferencia_segundos / 60, Integer)).label('tiempo_diferencia')),
            (diferencia_segundos < 86400, 
             (func.cast(diferencia_segundos / 3600, Integer)).label('tiempo_diferencia')),            
            (diferencia_segundos < 604800, 
             (func.cast(diferencia_segundos / 86400, Integer)).label('tiempo_diferencia')),
            (diferencia_segundos < 2592000, 
             (func.cast(diferencia_segundos / 604800, Integer)).label('tiempo_diferencia')),
            (diferencia_segundos < 31536000, 
             (func.cast(diferencia_segundos / 2592000, Integer)).label('tiempo_diferencia')),
            else_=(func.cast(diferencia_segundos / 31536000, Integer)).label('tiempo_diferencia')
        ).label('tiempo_desde_inversión')

        tiempo_valor = db.query(tiempo_diferencia_valor).filter(Proyecto.id == proyecto.id).scalar()

        tiempo_diferencia_valor_total = case(
            (diferencia_segundos_total < 60, 0),
            (diferencia_segundos_total < 3600, 
             (func.cast(diferencia_segundos_total / 60, Integer)).label('tiempo_diferencia')),
            (diferencia_segundos_total < 86400, 
             (func.cast(diferencia_segundos_total / 3600, Integer)).label('tiempo_diferencia')),            
            (diferencia_segundos_total < 604800, 
             (func.cast(diferencia_segundos_total / 86400, Integer)).label('tiempo_diferencia')),
            (diferencia_segundos_total < 2592000, 
             (func.cast(diferencia_segundos_total / 604800, Integer)).label('tiempo_diferencia')),
            (diferencia_segundos_total < 31536000, 
             (func.cast(diferencia_segundos_total / 2592000, Integer)).label('tiempo_diferencia')),
            else_=(func.cast(diferencia_segundos_total / 31536000, Integer)).label('tiempo_diferencia')
        ).label('tiempo_desde_inversión_total')

        tiempo_valor_total = db.query(tiempo_diferencia_valor_total).filter(Proyecto.id == proyecto.id).scalar()

        tiempo_diferencia_unidad = case(
            (diferencia_segundos < 60, 'minutos'),
            (diferencia_segundos < 3600, 'minutos'),
            (diferencia_segundos < 86400, 'horas'),
            (diferencia_segundos < 604800, 'días'),
            (diferencia_segundos < 2592000, 'semanas'),
            (diferencia_segundos < 31536000, 'meses'),
            else_='años'
        ).label('tiempo_unidad')

        tiempo_unidad = db.query(tiempo_diferencia_unidad).filter(Proyecto.id == proyecto.id).scalar()

        tiempo_diferencia_unidad_total = case(
            (diferencia_segundos_total < 60, 'minutos'),
            (diferencia_segundos_total < 3600, 'minutos'),
            (diferencia_segundos_total < 86400, 'horas'),
            (diferencia_segundos_total < 604800, 'días'),
            (diferencia_segundos_total < 2592000, 'semanas'),
            (diferencia_segundos_total < 31536000, 'meses'),
            else_='años'
        ).label('tiempo_unidad_total')

        tiempo_unidad_total = db.query(tiempo_diferencia_unidad_total).filter(Proyecto.id==proyecto.id).scalar()

        inversores = db.query(func.count(func.distinct(Inversion.inversor_id))) \
                    .filter(Inversion.proyecto_id == proyecto.id).scalar() or 0
        
        porcentaje_reacudado = (int) (
            (proyecto.monto_recaudado or Decimal('0.00')) / 
            (proyecto.monto_pedido or Decimal('1.00')) * 100
        )
        
        proyectos_emprendedor.append({
            "id": proyecto.id,
            "nombre_proyecto": proyecto.nombre_proyecto,
            "total_recaudado": proyecto.monto_recaudado,
            "objetivo": proyecto.monto_pedido,
            "porcentaje": porcentaje_reacudado,
            "estado": proyecto.estado,
            "descripcion": proyecto.descripcion,
            "descripcion_extendida": proyecto.descripcion_extendida,
            "tiempo_valor": tiempo_valor,
            "tiempo_unidad": tiempo_unidad,
            "tiempo_valor_total": tiempo_valor_total,
            "tiempo_unidad_total": tiempo_unidad_total,
            "inversores": inversores
        })
    
    return proyectos_emprendedor

@router.get("/proyectos-invertidos/{usuario_id}")
def obtener_proyectos_invertidos(usuario_id: int, db: Session = Depends(get_db)):
    inversor = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not inversor:
        raise HTTPException(status_code=404, detail="Inversor no encontrado")

    inversiones = db.query(Inversion).filter_by(inversor_id=inversor.id).all()
    proyectos_invertidos = []

    for inversion in inversiones:
        proyecto = db.query(Proyecto).filter_by(id=inversion.proyecto_id).first()
        if proyecto:
            existing = next((p for p in proyectos_invertidos if p['proyecto_id'] == proyecto.id), None)
            if existing:
                existing['monto_invertido'] = str(Decimal(existing['monto_invertido']) + Decimal(str(inversion.monto_invertido)))
                existing['fecha_inversion'] = max(existing['fecha_inversion'], inversion.fecha_inversion.isoformat())
            # Agregar solo si el proyecto no está ya en la lista
            else:
                proyectos_invertidos.append({
                    "proyecto_id": proyecto.id,
                    "titulo": proyecto.nombre_proyecto,
                    "descripcion": proyecto.descripcion,
                    "monto_invertido": str(inversion.monto_invertido),
                    "fecha_inversion": inversion.fecha_inversion.isoformat(),
                    "estado": inversion.estado,
                    "retorno_estimado": proyecto.retorno_estimado,
                })

    return proyectos_invertidos


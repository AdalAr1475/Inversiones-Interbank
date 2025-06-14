from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import DateTime, func
from db.conexion_db import get_db
from db.models import ProyectoInversion, Empresa, Inversion, Inversor
from config_token.authenticate import check_empresa

router = APIRouter(tags=["Projects"])

# ----------- Pydantic Schemas -----------
from pydantic import BaseModel
from decimal import Decimal
from datetime import date

class ProyectoCreate(BaseModel):
    empresa_id: int
    titulo: str
    descripcion: str
    monto_requerido: Decimal
    retorno_estimado: Decimal  # porcentaje
    fecha_inicio: date
    fecha_fin: date

# ----------- Endpoints -----------
@router.post("/", dependencies=[Depends(check_empresa)])
def crear_proyecto(data: ProyectoCreate, db: Session = Depends(get_db)):
    # Verificar que la empresa exista
    empresa = db.query(Empresa).filter_by(id=data.empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    nuevo_proyecto = ProyectoInversion(
        empresa_id=data.empresa_id,
        titulo=data.titulo,
        descripcion=data.descripcion,
        monto_requerido=data.monto_requerido,
        retorno_estimado=data.retorno_estimado,
        fecha_inicio=data.fecha_inicio,
        fecha_fin=data.fecha_fin,
        estado="abierto"  # por defecto
    )

    db.add(nuevo_proyecto)
    db.commit()
    db.refresh(nuevo_proyecto)

    return {"mensaje": "Proyecto de inversión creado", "proyecto_id": nuevo_proyecto.id}

@router.get("/get-show-proyectos")
def obtener_proyectos(limit: Optional[int] = None, db: Session = Depends(get_db)):
    proyecto_show = []  # Lista para almacenar todos los proyectos procesados
    
    if limit:
        proyectos = db.query(ProyectoInversion).limit(limit).all()
    else:
        proyectos = db.query(ProyectoInversion).all()

    for proyecto in proyectos:

        id = proyecto.id

        empresa = db.query(Empresa).filter(Empresa.id == proyecto.empresa_id).first()
        categoria = empresa.sector.capitalize() if empresa else "Desconocido"
        
        titulo = proyecto.titulo.capitalize()
        descripcion = proyecto.descripcion.capitalize()

        meta = (proyecto.monto_requerido or Decimal('0.00')).quantize(Decimal('0.01'))
        recaudado = (proyecto.monto_recaudado or Decimal('0.00')).quantize(Decimal('0.01'))

        inversores = db.query(func.count(func.distinct(Inversion.inversor_id))) \
                        .filter(Inversion.proyecto_id == proyecto.id).scalar() or 0
        
        proyecto_show_dict = {
            "id": id,
            "categoria": categoria,
            "titulo": titulo,
            "descripcion": descripcion,
            "meta": meta,
            "recaudado": recaudado,
            "inversores": inversores
        }

        proyecto_show.append(proyecto_show_dict)

    return proyecto_show


@router.get("/{proyecto_id}")
def obtener_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = db.query(ProyectoInversion).filter(ProyectoInversion.id == proyecto_id).first()
    
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    empresa = db.query(Empresa).filter(Empresa.id == proyecto.empresa_id).first()
    categoria = empresa.sector.capitalize() if empresa else "Desconocido"
    
    fecha_inicio = proyecto.fecha_inicio.strftime("%d/%m/%Y") if proyecto.fecha_inicio else None
    fecha_fin = proyecto.fecha_fin.strftime("%d/%m/%Y") if proyecto.fecha_fin else None
    porcentaje_reacudado = (int) (
        (proyecto.monto_recaudado or Decimal('0.00')) / 
        (proyecto.monto_requerido or Decimal('1.00')) * 100
    )
    estado = proyecto.estado
    inversores = db.query(func.count(func.distinct(Inversion.inversor_id))) \
                    .filter(Inversion.proyecto_id == proyecto.id).scalar() or 0

    return {
        "empresa": empresa.nombre_empresa.capitalize(),
        "id": proyecto.id,
        "categoria": categoria,
        "titulo": proyecto.titulo.capitalize(),
        "descripcion": proyecto.descripcion.capitalize(),
        "monto_requerido": (proyecto.monto_requerido or Decimal('0.00')).quantize(Decimal('0.01')),
        "monto_recaudado": (proyecto.monto_recaudado or Decimal('0.00')).quantize(Decimal('0.01')),
        "porcentaje": porcentaje_reacudado,
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "inversores": inversores,
        "estado": estado
    }
    
@router.get("/inversores/{proyecto_id}")
def obtener_inversores_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    
    result = db.query(
        Inversor.nombre_inversor,
        Inversor.apellido_inversor,
        (func.date(func.current_date()) - func.date(Inversion.fecha_inversion)).label('dias_desde_inversion')
    ).join(Inversor, Inversion.inversor_id == Inversor.id).filter(Inversion.proyecto_id == proyecto_id).all()

    # Verificar si hay resultados
    if not result:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # Convertir el resultado de las tuplas a diccionarios
    result_dict = [
        {
            "nombre_inversor": row[0],
            "apellido_inversor": row[1],
            "dias_desde_inversion": row[2]
        }
        for row in result
    ]
    
    # Serializar la respuesta usando jsonable_encoder
    response = jsonable_encoder(result_dict)

    # Regresar los datos serializados
    return response


@router.get("/proyectos-invertidos/{usuario_id}")
def obtener_proyectos_invertidos(usuario_id: int, db: Session = Depends(get_db)):
    inversor = db.query(Inversor).filter_by(usuario_id=usuario_id).first()
    if not inversor:
        raise HTTPException(status_code=404, detail="Inversor no encontrado")

    inversiones = db.query(Inversion).filter_by(inversor_id=inversor.id).all()
    proyectos_invertidos = []

    for inversion in inversiones:
        proyecto = db.query(ProyectoInversion).filter_by(id=inversion.proyecto_id).first()
        if proyecto:
            existing = next((p for p in proyectos_invertidos if p['proyecto_id'] == proyecto.id), None)
            if existing:
                existing['monto_invertido'] = str(Decimal(existing['monto_invertido']) + Decimal(str(inversion.monto_invertido)))
                existing['fecha_inversion'] = max(existing['fecha_inversion'], inversion.fecha_inversion.isoformat())
            # Agregar solo si el proyecto no está ya en la lista
            else:
                proyectos_invertidos.append({
                    "proyecto_id": proyecto.id,
                    "titulo": proyecto.titulo,
                    "descripcion": proyecto.descripcion,
                    "monto_invertido": str(inversion.monto_invertido),
                    "fecha_inversion": inversion.fecha_inversion.isoformat(),
                    "estado": inversion.estado
                })

    return proyectos_invertidos
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.conexion_db import get_db
from db.models import ProyectoInversion, Empresa, Inversion
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
    
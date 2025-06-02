from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.conexion_db import get_db
from db.models import ProyectoInversion, Empresa

router = APIRouter()

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
@router.post("/", tags=["Projects"])
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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.conexion_db import get_db
from db.models import RecargaWallet, Inversion, Proyecto, Usuario, Wallet
from decimal import Decimal

from pydantic import BaseModel
from decimal import Decimal


router = APIRouter(tags=["Investment"])


# ----------- Pydantic Schemas -----------
class InversionRequest(BaseModel):
    inversor_id: int
    proyecto_id: int
    monto: Decimal


# ----------- Endpoints -----------
@router.get("/dashboard/{inversor_id}")
def obtener_dashboard(inversor_id: int, db: Session = Depends(get_db)):
    inversor = db.query(Usuario).filter_by(id=inversor_id).first()
    if not inversor:
        raise HTTPException(status_code=404, detail="Inversor no encontrado")
    inversiones = db.query(Inversion).filter_by(inversor_id=inversor_id).all()
    proyectos = db.query(Proyecto).filter(Proyecto.id.notin_([inv.proyecto_id for inv in inversiones])).all()
    return {
        "porfolio_total": sum(inv.monto_invertido for inv in inversiones),
        "proyectos_activos" : len(set([inv.proyecto_id for inv in inversiones])),
        "proyectos_disponibles": len(proyectos),
    }
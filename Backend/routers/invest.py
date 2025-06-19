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

#Endpoint para obtener todas las inversiones de un inversor
@router.get("/get-inversiones-usuario/{inversor_id}")
def obtener_inversiones(inversor_id: int, db: Session = Depends(get_db)):
    inversiones = db.query(Inversion).filter_by(inversor_id=inversor_id).all()
    if not inversiones:
        raise HTTPException(status_code=404, detail="No se encontraron inversiones para este inversor")
    return inversiones

#Endpoint para obtener el id de la ultima inversion creada en un proyecto
@router.get("/get-ultima-inversion-proyecto/{proyecto_id}")
def obtener_ultima_inversion(proyecto_id: int, db: Session = Depends(get_db)):
    ultima_inversion = db.query(Inversion).filter_by(proyecto_id=proyecto_id).order_by(Inversion.fecha_inversion.desc()).first()
    if not ultima_inversion:
        raise HTTPException(status_code=404, detail="No se encontraron inversiones para este proyecto")
    return {"ultima_inversion_id": ultima_inversion.id}
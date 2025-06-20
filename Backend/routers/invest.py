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

    inversiones_list = []

    for inversion in inversiones:
        proyecto_nombre = db.query(Proyecto).filter(Proyecto.id==inversion.proyecto_id).first().nombre_proyecto

        inversion_dict = {
            "proyecto_nombre": proyecto_nombre,
            "inversor_id": inversion.inversor_id,
            "fecha_inversion": inversion.fecha_inversion,
            "id": inversion.id,
            "monto_invertido": inversion.monto_invertido,
            "estado": inversion.estado
        }

        inversiones_list.append(inversion_dict)

    return inversiones_list

#Request para el endpoint de abajo
class UltimaInversionRequest(BaseModel):
    proyecto_id: int
    usuario_id: int

#Endpoint para obtener el id de la ultima inversion creada en un proyecto
@router.post("/get-ultima-inversion-proyecto")
def obtener_ultima_inversion(request: UltimaInversionRequest, db: Session = Depends(get_db)):
    #Obtener la última inversión de un usuario para un proyecto específico
    ultima_inversion = db.query(Inversion).filter(
        Inversion.proyecto_id == request.proyecto_id,
        Inversion.inversor_id == request.usuario_id
    ).order_by(Inversion.id.desc()).first()

     #Si no se encuentra una inversión, lanzar una excepción
     #Esto es para evitar que se retorne None y se genere un error en el frontend
    if not ultima_inversion:
        raise HTTPException(status_code=404, detail="No se encontraron inversiones para este proyecto")
    return {"ultima_inversion_id": ultima_inversion.id}
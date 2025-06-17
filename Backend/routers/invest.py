from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.conexion_db import get_db
from db.models import RecargaWallet, Inversion, Proyecto, Wallet
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel
from decimal import Decimal

from  config_token.authenticate import get_current_user

router = APIRouter(dependencies= [Depends(get_current_user)], tags=["Investment"])


# ----------- Pydantic Schemas -----------
class InversionRequest(BaseModel):
    inversor_id: int
    proyecto_id: int
    monto: Decimal


# ----------- Endpoints -----------
@router.post("/invertir")
def invertir_en_proyecto(data: InversionRequest, db: Session = Depends(get_db)):
    # 1. Verificar existencia del proyecto
    proyecto = db.query(ProyectoInversion).filter_by(id=data.proyecto_id, estado="abierto").first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto de inversión no encontrado o no disponible")

    # 2. Calcular saldo disponible
    wallet_inversor = db.query(Wallet).filter_by(inversor_id=data.inversor_id).first()
    if not wallet_inversor:
        raise HTTPException(status_code=404, detail="Wallet del inversor no encontrada")
    
    saldo_disponible = wallet_inversor.saldo
    if data.monto > saldo_disponible:
        raise HTTPException(status_code=400, detail="Saldo insuficiente para esta inversión")

    # 3. Verificar si el monto de inversión es mayor que el monto requerido del proyecto

    if data.monto < proyecto.monto_requerido:
        raise HTTPException(status_code=400, detail="El monto de inversión tiene que ser mayor que el monto requerido del proyecto")

    # 4. Crear la inversión
    nueva_inversion = Inversion(
        proyecto_id=data.proyecto_id,
        inversor_id=data.inversor_id,
        monto_invertido=data.monto,
        estado="pendiente",  # puedes cambiar a "firmado" si ya está confirmada
        fecha_inversion=datetime.utcnow()
    )

    # 5. Actualizar el Wallet del inversor
    wallet_inversor.saldo -= data.monto

    db.add(nueva_inversion)
    db.add(wallet_inversor)
    db.commit()
    db.refresh(nueva_inversion)

    return {"mensaje": "Inversión registrada exitosamente", "inversion_id": nueva_inversion.id}

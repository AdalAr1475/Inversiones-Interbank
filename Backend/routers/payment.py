from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.conexion_db import get_db
from db.models import Inversion, Wallet, RecargaWallet, Proyecto
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from config_token.authenticate import get_current_user
from db.models import Usuario
router = APIRouter(tags=["Payment"])

# ----------- Pydantic Schemas -----------
class RecargaRequest(BaseModel):
    inversor_id: int
    monto: Decimal

# ----------- Endpoints -----------

# @router.post("/recargar-wallet/")
# def recargar_wallet(data: RecargaRequest, db: Session = Depends(get_db)):
#     # Verificar que el inversor existe
#     inversor = db.query(Inversor).filter_by(id=data.inversor_id).first()
#     if not inversor:
#         raise HTTPException(status_code=404, detail="Inversor no encontrado")

#     # Buscar o crear la billetera
#     wallet = db.query(Wallet).filter_by(inversor_id=data.inversor_id).first()
#     if not wallet:
#         wallet = Wallet(inversor_id=data.inversor_id, saldo=data.monto)
#         db.add(wallet)
#     else:
#         wallet.saldo += data.monto

#     # Registrar recarga
#     recarga = RecargaWallet(
#         inversor_id=data.inversor_id,
#         monto=data.monto,
#         estado="simulado",  # Luego esto puede cambiarse a 'exitoso' tras validar con Stripe
#         fecha_recarga=datetime.utcnow()
#     )
#     db.add(recarga)
#     db.commit()
#     db.refresh(wallet)

#     return {"mensaje": "Recarga registrada", "nuevo_saldo": str(wallet.saldo)}

@router.get("/wallet/{inversor_id}")
def obtener_saldo(inversor_id: int, db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter_by(inversor_id=inversor_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet no encontrada")
    return {"inversor_id": inversor_id, "saldo": str(wallet.saldo)}

@router.get("/recargas/{inversor_id}")
def obtener_recargas(inversor_id: int, db: Session = Depends(get_db)):
    recargas = db.query(RecargaWallet).filter_by(inversor_id=inversor_id).all()
    return [
        {
            "id": r.id,
            "monto": str(r.monto),
            "estado": r.estado,
            "fecha_recarga": r.fecha_recarga.isoformat()
        } for r in recargas
    ]


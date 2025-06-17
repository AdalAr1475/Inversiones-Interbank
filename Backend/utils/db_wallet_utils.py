# utils/db_wallet.py
from sqlalchemy.orm import Session
from db.models import Wallet, RecargaWallet, Inversion, Usuario, Proyecto
from datetime import datetime
from decimal import Decimal

def registrar_recarga(inversor_id: int, monto: Decimal, db: Session):
    wallet = db.query(Wallet).filter_by(inversor_id=inversor_id).first()
    if not wallet:
        wallet = Wallet(inversor_id=inversor_id, saldo=monto)
        db.add(wallet)
    else:
        wallet.saldo += monto

    recarga = RecargaWallet(
        inversor_id=inversor_id,
        monto=monto,
        estado="Simulado",
        fecha_recarga=datetime.utcnow()
    )
    db.add(recarga)
    db.commit()
    db.refresh(wallet)

    return {"mensaje": "Recarga registrada", "nuevo_saldo": str(wallet.saldo)}

def obtener_wallet(inversor_id: int, db: Session):
    wallet = db.query(Wallet).filter_by(inversor_id=inversor_id).first()
    if not wallet:
        return None
    return {"inversor_id": inversor_id, "saldo": str(wallet.saldo)}

def obtener_recargas(inversor_id: int, db: Session):
    recargas = db.query(RecargaWallet).filter_by(inversor_id=inversor_id).all()
    return [
        {
            "id": r.id,
            "monto": str(r.monto),
            "estado": r.estado,
            "fecha_recarga": r.fecha_recarga.isoformat()
        } for r in recargas
    ]

def procesar_inversion(inversor_id: int, proyecto_id: int, monto: Decimal, db: Session):
    proyecto = db.query(Proyecto).filter_by(id=proyecto_id, estado="activo").first()
    if not proyecto:
        raise ValueError("Proyecto de inversión no encontrado o no disponible")
    
    usuario = db.query(Usuario).filter_by(id=inversor_id).first()
    if not usuario:
        raise ValueError("Usuario no encontrado")


    wallet_inversor = db.query(Wallet).filter_by(inversor_id=usuario.id).first()
    if not wallet_inversor:
        raise ValueError("Wallet del inversor no encontrada")

    if monto > wallet_inversor.saldo:
        raise ValueError("Saldo insuficiente para esta inversión")

    proyecto.monto_recaudado += monto
    if proyecto.monto_recaudado >= proyecto.monto_pedido:
        proyecto.estado = "completado"
    else:
        proyecto.estado = "activo"

    
    nueva_inversion = Inversion(
        proyecto_id=proyecto_id,
        inversor_id=inversor_id,
        monto_invertido=monto,
        estado="pendiente",
        fecha_inversion=datetime.utcnow()
    )

    wallet_inversor.saldo -= monto

    db.add(nueva_inversion)
    db.add(wallet_inversor)
    db.add(proyecto)
    db.commit()
    db.refresh(nueva_inversion)

    return {"mensaje": "Inversión registrada exitosamente", "inversion_id": nueva_inversion.id}

def crear_wallet(inversor_id: int, db: Session):
    wallet = Wallet(inversor_id=inversor_id, saldo=0)
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return {"mensaje": "Wallet creada exitosamente", "wallet_id": wallet.id}
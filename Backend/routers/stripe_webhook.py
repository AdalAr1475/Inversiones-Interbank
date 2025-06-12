from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
import stripe
import dotenv
import logging
from decimal import Decimal

from db.conexion_db import get_db
from utils.db_wallet_utils import registrar_recarga

dotenv.load_dotenv()
DOTENV_VALUES = dotenv.dotenv_values()

router = APIRouter()
stripe.api_key = DOTENV_VALUES["STRIPE_SECRET_KEY"]
WEBHOOK_SECRET = DOTENV_VALUES["WEB_HOOK_SECRET"]

logger = logging.getLogger(__name__)

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    logger.info(f"🔔 Evento recibido: {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"] 
        user_id = session["metadata"].get("user_id")
        amount_total = session["amount_total"]  # en centavos

        logger.info(f"💸 Recarga completada para el usuario {user_id}: ${amount_total / 100:.2f}")

        try:
            resultado = registrar_recarga(
                inversor_id=int(user_id),
                monto=Decimal(amount_total) / 100,
                db=db
            )
            logger.info(f"✅ Recarga registrada: {resultado}")
        except Exception as e:
            logger.error(f"❌ Error al registrar recarga: {str(e)}")
            raise HTTPException(status_code=500, detail="Error al actualizar base de datos")

    elif event_type == "account.updated":
        account = event["data"]["object"]
        if account.get("charges_enabled"):
            logger.info(f"✅ Cuenta conectada habilitada: {account['id']}")

    elif event_type == "transfer.failed":
        transfer = event["data"]["object"]
        logger.warning(f"⚠️ Transferencia fallida: {transfer['id']}")

    return {"status": "success"}

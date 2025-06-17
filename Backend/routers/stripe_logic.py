from fastapi import APIRouter, Depends, HTTPException

from pydantic import BaseModel
from requests import Session
from db.conexion_db import get_db
from db.models import Proyecto, Usuario
from utils.stripe_utils import (
    create_stripe_customer,
    create_connected_account,
    create_account_onboarding_link,
    create_checkout_session_for_wallet,
    transfer_funds_to_connected_account
)

router = APIRouter(tags=["Stripe"])

# ----------- Pydantic Schemas -----------
class CustomerRequest(BaseModel):
    fullname: str
    email: str

class ConnectedAccountRequest(BaseModel):
    email: str
    business_type: str = 'company'
    country: str = 'US'

class OnboardingLinkRequest(BaseModel):
    account_id: str
    return_url: str
    refresh_url: str

class CheckoutSessionRequest(BaseModel):
    user_id: str
    amount_cents: int

class TransferRequest(BaseModel):
    amount_cents: int
    inversor_id: str = None
    proyecto_id: str = None
    tipo: str = "inversion"  # puede ser "inversion", "transferencia", etc.

# ----------- Endpoints -----------

@router.post("/create-customer")
def stripe_create_customer(data: CustomerRequest):
    customer = create_stripe_customer(data.fullname, data.email)
    if not customer:
        raise HTTPException(status_code=500, detail="No se pudo crear el cliente en Stripe")
    return {"customer_id": customer.id}


@router.post("/create-connected-account")
def stripe_create_connected_account(data: ConnectedAccountRequest):
    account = create_connected_account(
        email=data.email,
        business_type=data.business_type,
        country=data.country
    )
    return account


@router.post("/create-onboarding-link")
def stripe_create_onboarding_link(data: OnboardingLinkRequest):
    url = create_account_onboarding_link(
        account_id=data.account_id,
        return_url=data.return_url,
        refresh_url=data.refresh_url
    )
    return {"onboarding_url": url}


@router.post("/create-checkout-session")
def stripe_create_checkout_session(data: CheckoutSessionRequest):
    url = create_checkout_session_for_wallet(
        user_id=data.user_id,
        amount_cents=data.amount_cents
    )
    return {"checkout_url": url}


@router.post("/transfer-funds")
def stripe_transfer_funds(data: TransferRequest, db: Session = Depends(get_db)):
    metadata = {
        "tipo": data.tipo
    }
    
    # Añadir información adicional a metadata si está disponible
    if data.inversor_id:
        metadata["inversor_id"] = data.inversor_id
    if data.proyecto_id:
        metadata["proyecto_id"] = data.proyecto_id
    
    proyecto = db.query(Proyecto).filter_by(id=data.proyecto_id).first() if data.proyecto_id else None
    stripe_connect_account_id = db.query(Usuario).filter_by(id=proyecto.emprendedor_id).first().stripe_account_id if proyecto else "acct_1RZ2NuBOgx1Ph13F"
    print(f"Stripe Connect Account ID: {stripe_connect_account_id}")

    transfer = transfer_funds_to_connected_account(
        amount_cents=data.amount_cents,
        connected_account_id=stripe_connect_account_id,
        metadata=metadata
    )
    return {"transfer_id": transfer.id}




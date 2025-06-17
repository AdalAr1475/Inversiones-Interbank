import stripe
import dotenv

dotenv.load_dotenv()

DOTENV_VALUES = dotenv.dotenv_values()
stripe.api_key = DOTENV_VALUES["STRIPE_SECRET_KEY"]

def create_stripe_customer(fullname: str,email: str):
    
    """
    Crea una cuenta conectada en Stripe para un fondo de inversión.
    Retorna el objeto de la cuenta creada.
    """

    try:
        customer = stripe.Customer.create(
            email=email,
            name=fullname,
            description="Cliente de prueba creado desde entorno de desarrollo"
        )

        print(f"Cliente creado: {customer['id']}")
        return customer
    
    except Exception as e:
        print(f"Error al crear cliente en Stripe: {str(e)}")
        return None

# Ejemplo de uso:
# create_stripe_customer("Diogo Abregu", "diogofabricio17@gmail.com")

def create_connected_account(email: str, business_type: str = 'company', country: str = 'US'):
    """
    Crea una cuenta conectada en Stripe para un fondo de inversión.
    Retorna el objeto de la cuenta creada.
    """
    try:
        account = stripe.Account.create(
            type='express', 
            country=country,
            email=email,
            capabilities={
                'card_payments': {'requested': True},
                'transfers': {'requested': True},
            },
            business_type=business_type,
        )
        return account.to_dict()
    except stripe.error.StripeError as e:
        print(f"Error al crear cuenta conectada: {e}")
        raise

account = stripe.Account.retrieve("acct_1Rb3ShB1VrcHHR4Y")
print(account.capabilities.transfers)

# Ejemplo de Uso:
# account = create_connected_account("diogofabricio191233141@gmail.com", business_type='individual', country='US')
# print(f"Cuenta conectada creada: {account['id']}")
def create_account_onboarding_link(account_id: str, return_url: str, refresh_url: str) -> str:
    """
    Genera un enlace para que el fondo de inversión complete su onboarding con Stripe.
    Retorna la URL del enlace.
    """
    try:
        account_link = stripe.AccountLink.create(
            account=account_id,
            refresh_url=refresh_url,
            return_url=return_url,
            type='account_onboarding',
        )
        return account_link.url
    except stripe.error.StripeError as e:
        print(f"Error al crear enlace de onboarding: {e}")
        raise
# Ejemplo de uso:
# onboarding_link = create_account_onboarding_link(
    account_id="acct_1Rb3SYBNpE9Qh3BQ",  # Reemplaza con el ID de la cuenta conectada
    return_url="https://tuapp.com/return",
    refresh_url="https://tuapp.com/refresh"
#)
# print(f"Enlace de onboarding: {onboarding_link}")



def create_checkout_session_for_wallet(user_id: str, amount_cents: int) -> str:
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": "Recarga de saldo",
                },
                "unit_amount": amount_cents,
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=f"http://localhost:3000/dashboard?success=true&user_id={user_id}&amount={amount_cents}",  # puedes usar IDs seguros con JWT o hash
        cancel_url="http://localhost:3000/dashboard?success=false",
        metadata={"user_id": user_id},  # importante para verificar luego
    )
    return session.url

# Ejemplo de uso (Para la recarga utilizar 4000000000000077 como número de tarjeta de prueba):
# checkouyt_url = create_checkout_session_for_wallet(
#   user_id="12345",  # Reemplaza con el ID del usuario
#   amount_cents=5000  # Monto en centavos (50.00 USD)
# )
# print(f"URL de checkout: {checkouyt_url}")

def transfer_funds_to_connected_account(amount_cents: int, connected_account_id: str, metadata: dict = None):
    """
    Transfiere fondos a una cuenta conectada de Stripe.
    
    Args:
        amount_cents: Monto en centavos a transferir
        connected_account_id: ID de la cuenta conectada de Stripe
        metadata: Metadatos adicionales (inversor_id, proyecto_id, etc.)
        
    Returns:
        Objeto Transfer de Stripe
    """
    try:
        transfer_params = {
            "amount": amount_cents,
            "currency": "usd",
            "destination": connected_account_id
        }
        
        # Añadir metadata si está disponible
        if metadata:
            transfer_params["metadata"] = metadata
        
        transfer = stripe.Transfer.create(**transfer_params)
        return transfer
    except stripe.error.StripeError as e:
        print(f"Error al transferir fondos: {e}")
        raise


# Ejemplo de uso:

# transfer = transfer_funds_to_connected_account(
#    amount_cents=2000,  # Monto en centavos (20.00 USD)
#    connected_account_id="acct_1RZ2NuBOgx1Ph13F",  # Reemplaza con el ID de la cuenta conectada
#    description="Pago por servicios prestados"
# )
# print(f"Transferencia realizada: {transfer['id']}") if transfer else print("Error al realizar la transferencia")



# Ejemplo de uso:
# checkout_url = create_checkout_session_for_investment(
#     inversor_id="inv_123456",
#     proyecto_id="proj_123456",
#     amount_cents=10000,
#     proyecto_titulo="Mi Proyecto de Inversión"
# )
# print(f"URL de checkout para inversión: {checkout_url}")
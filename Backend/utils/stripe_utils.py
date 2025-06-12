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

async def create_connected_account(email: str, business_type: str = 'company', country: str = 'US'):
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

# Ejemplo de Uso:
account = create_connected_account("diogofabricio17@gmail.com", business_type='individual', country='US')
print(account)

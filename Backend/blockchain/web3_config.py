from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

WEB3_PROVIDER = os.getenv("WEB3_PROVIDER")
ACCOUNT_ADDRESS = os.getenv("ACCOUNT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

assert WEB3_PROVIDER and ACCOUNT_ADDRESS and PRIVATE_KEY, "Faltan variables de entorno"

web3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
assert web3.is_connected(), "No se pudo conectar a Web3"

account_address = web3.to_checksum_address(ACCOUNT_ADDRESS)
private_key = PRIVATE_KEY

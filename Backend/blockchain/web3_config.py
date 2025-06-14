from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  # Nodo local
print("Conexión a nodo Web3:", web3.is_connected())
account_address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"  # Dirección Hardhat
private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"  # Clave privada correspondiente (usa con precaución solo localmente)

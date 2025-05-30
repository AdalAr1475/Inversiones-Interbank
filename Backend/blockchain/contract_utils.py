import json
import os
from .web3_config import web3, account_address, private_key

# ABI generado al compilar el contrato Solidity
contract_abi = json.loads("""
[
  {
    "constant": true,
    "inputs": [],
    "name": "myMethod",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
""")
contract_address = web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS"))
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

def sign_document(document_hash: str):
    nonce = web3.eth.get_transaction_count(account_address)
    txn = contract.functions.signDocument(document_hash).build_transaction({
        'from': account_address,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': web3.to_wei('20', 'gwei')
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return web3.to_hex(tx_hash)

def is_signed(document_hash: str) -> bool:
    return contract.functions.signedDocuments(document_hash).call()

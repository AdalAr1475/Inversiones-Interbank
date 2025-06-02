import json
import os
#from .web3_config import web3, account_address, private_key

"""
contract_abi = json.loads("""
[
  {
    "inputs": [{"internalType": "bytes32", "name": "docHash", "type": "bytes32"}],
    "name": "signDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "docHash", "type": "bytes32"}],
    "name": "signedDocuments",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
]
""")
contract_address = web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS"))
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

def sign_document(document_hash: str):
    # Convertir string hash a bytes32
    doc_hash_bytes = bytes.fromhex(document_hash[2:])  # remove '0x' and convert
    nonce = web3.eth.get_transaction_count(account_address)
    txn = contract.functions.signDocument(doc_hash_bytes).build_transaction({
        'from': account_address,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': web3.to_wei('20', 'gwei')
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return web3.to_hex(tx_hash)

def is_signed(document_hash: str) -> bool:
    doc_hash_bytes = bytes.fromhex(document_hash[2:])
    return contract.functions.signedDocuments(doc_hash_bytes).call()
"""

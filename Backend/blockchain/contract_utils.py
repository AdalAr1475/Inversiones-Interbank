import json
import os
from .web3_config import web3, account_address, private_key


# ABI copiado desde DocumentSigner.json
contract_abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "bytes32",
          "name": "documentHash",
          "type": "bytes32"
        },
        {
          "indexed": False,
          "internalType": "address",
          "name": "signer",
          "type": "address"
        }
      ],
      "name": "DocumentSigned",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "documentHash",
          "type": "bytes32"
        }
      ],
      "name": "isSigned",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "documentHash",
          "type": "bytes32"
        }
      ],
      "name": "signDocument",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "signedDocuments",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

contract_address = web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS"))
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Función para firmar
def sign_document(document_hash: str):
    nonce = web3.eth.get_transaction_count(account_address)
    txn = contract.functions.signDocument(web3.to_bytes(hexstr=document_hash)).build_transaction({
        'from': account_address,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': web3.to_wei('1', 'gwei')
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return web3.to_hex(tx_hash)

def is_signed(document_hash: str) -> bool:
    return contract.functions.isSigned(web3.to_bytes(hexstr=document_hash)).call()






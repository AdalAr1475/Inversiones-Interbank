import hashlib
from fastapi import APIRouter, UploadFile, File
from blockchain.contract_utils import sign_document, is_signed
from fastapi import APIRouter

router = APIRouter()

def hash_document(file_bytes):
    return '0x' + hashlib.sha256(file_bytes).hexdigest()

@router.post("/sign-document/", tags=["Blockchain"])
async def sign(file: UploadFile = File(...)):
    contents = await file.read()
    doc_hash = hash_document(contents)
    tx = sign_document(doc_hash)
    return {"message": "Documento firmado", "tx_hash": tx}

@router.post("/verify-document/", tags=["Blockchain"])
async def verify(file: UploadFile = File(...)):
    contents = await file.read()
    doc_hash = hash_document(contents)
    signed = is_signed(doc_hash)
    return {"hash": doc_hash, "signed": signed}

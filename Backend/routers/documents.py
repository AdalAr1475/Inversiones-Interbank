import base64
import hashlib
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from requests import Session
from blockchain.contract_utils import sign_document, is_signed
from db.conexion_db import get_db
from db.models import FirmaElectronica
import utils.documents_utils as doc_utils
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

def hash_document(file_bytes):
    return '0x' + hashlib.sha256(file_bytes).hexdigest()

# Modelo para la petición
class FirmarDocumentoRequest(BaseModel):
    documento_id: int
    usuario_id: int
    contenido_base64: str

@router.post("/firmar-documento")
def firmar_documento(data: FirmarDocumentoRequest, db=Depends(get_db)):
    try:
        # Decodificar y generar hash
        contenido_bytes = base64.b64decode(data.contenido_base64)
        document_hash = hashlib.sha256(contenido_bytes).hexdigest()

        # Simula firma en blockchain
        tx_hash = sign_document(document_hash)

        # Guarda en base de datos con SQLAlchemy
        firma = FirmaElectronica(
            usuario_id=data.usuario_id,
            documento_id=data.documento_id,
            document_hash=document_hash,
            tx_hash=tx_hash,
        )

        db.add(firma)
        db.commit()
        db.refresh(firma)

        return {"mensaje": "Documento firmado con éxito", "tx_hash": tx_hash}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/verify-document/", tags=["Blockchain"])
async def verify(file: UploadFile = File(...)):
    contents = await file.read()
    doc_hash = hash_document(contents)
    signed = is_signed(doc_hash)
    return {"hash": doc_hash, "signed": signed}

class RegistrarDocumentoRequest(BaseModel):
    proyecto_id: int
    nombre: str
    descripcion: str
    contenido_base64: str
    tipo_documento: str
    visibilidad: str = "privado"  # público | privado

@router.post("/registrar-documento")
def crear_documento_endpoint(request: RegistrarDocumentoRequest, db: Session = Depends(get_db)):
    try:
        documento_id = doc_utils.registrar_documento(
            proyecto_id=request.proyecto_id,
            nombre=request.nombre,
            descripcion=request.descripcion,
            contenido_base64=request.contenido_base64,
            tipo_documento=request.tipo_documento, # ¡NUEVO! Pasar el tipo de documento
            visibilidad=request.visibilidad,
            db=db
        )
        return {"mensaje": "Documento registrado con éxito", "documento_id": documento_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar documento: {str(e)}")

    
@router.get("/documento/{documento_id}")
def obtener_documento(documento_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT url FROM Documentos_proyecto WHERE id = %s", (documento_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if result:
        return FileResponse(path=result[0], filename=os.path.basename(result[0]), media_type='application/octet-stream')
    else:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    

@router.get("/documentos/{proyecto_id}")
def listar_documentos(proyecto_id: int, db=Depends(get_db)):
    return doc_utils.listar_documentos(proyecto_id,db)

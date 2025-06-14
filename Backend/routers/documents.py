import base64
import hashlib
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from blockchain.contract_utils import sign_document, is_signed
from db.conexion_db import get_db
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
    tipo_documento: str
    contenido_base64: str

@router.post("/firmar-documento")
def firmar_documento(data: FirmarDocumentoRequest):
    try:
        # Decodificar el contenido del documento
        contenido_bytes = base64.b64decode(data.contenido_base64)

        # Generar hash del documento
        document_hash = hashlib.sha256(contenido_bytes).hexdigest()

        # Firmar en blockchain
        tx_hash = sign_document(document_hash)

        # Guardar en base de datos
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Firmas_electronicas (usuario_id, documento_id, document_hash, tx_hash, tipo_documento)
            VALUES (%s, %s, %s, %s, %s)
        """, (data.usuario_id, data.documento_id, document_hash, tx_hash, data.tipo_documento))
        conn.commit()
        cursor.close()
        conn.close()

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
    visibilidad: str = "privado"  # público | privado

@router.post("/registrar-documento")
def registrar_documento(data: RegistrarDocumentoRequest):
    try:
        documento_id = doc_utils.registrar_documento(
            proyecto_id=data.proyecto_id,
            nombre=data.nombre,
            descripcion=data.descripcion,
            contenido_base64=data.contenido_base64
        )

        return {"mensaje": "Documento registrado correctamente", "documento_id": documento_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
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

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

router = APIRouter(
    tags=["Documentos"]
)

def hash_document(file_bytes):
    return '0x' + hashlib.sha256(file_bytes).hexdigest()


@router.post("/firmar-documento")
def firmar_documento(documento_id: int, db=Depends(get_db)):
    return doc_utils.firmar_documento(documento_id, db)

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
    usuario_id: int  

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
            inversor_id=request.usuario_id, # Asumiendo que el inversor_id es el usuario_id
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

@router.get("/contrato-por-inversion/{inversion_id}")
def obtener_documento_por_inversion(inversion_id: int, db=Depends(get_db)):
    """
    Endpoint para obtener el documento de contrato asociado a una inversión específica.
    Retorna el contenido del documento en base64.
    """
    try:
        documento = doc_utils.obtener_documento_por_inversion(inversion_id, db)
        if not documento:
            raise HTTPException(status_code=404, detail="Documento no encontrado")
        return documento
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener documento: {str(e)}")

@router.get("/copiar-contrato/{proyecto_id}")
def copiar_contrato(proyecto_id: int, db=Depends(get_db)):
    """
    Endpoint para copiar la plantilla de contrato de un proyecto específico.
    Retorna el id del contrato creado.
    """
    try:
        contrato_id = doc_utils.copiar_contrato(proyecto_id, db)
        return {"ID del contrato copiado": contrato_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al copiar contrato: {str(e)}")
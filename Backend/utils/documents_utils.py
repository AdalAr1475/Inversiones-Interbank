import base64
import hashlib
import os
from datetime import datetime

from fastapi import HTTPException
from requests import Session, session
from blockchain.contract_utils import sign_document
from db import models
from db.conexion_db import get_db
from db.models import DocumentoProyecto, FirmaElectronica, Inversion

CARPETA_DOCUMENTOS = "archivos"

def guardar_archivo(contenido_base64, nombre_archivo):
    contenido_bytes = base64.b64decode(contenido_base64)

    if not os.path.exists(CARPETA_DOCUMENTOS):
        os.makedirs(CARPETA_DOCUMENTOS)

    ruta_archivo = os.path.join(CARPETA_DOCUMENTOS, nombre_archivo)

    with open(ruta_archivo, "wb") as f:
        f.write(contenido_bytes)

    return ruta_archivo  # puedes adaptar esto a una URL pública si estás sirviendo archivos con FastAPI/NGINX/etc.

def registrar_documento(
    inversion_id: int, # CORREGIDO: Se usa inversion_id para coincidir con el modelo.
    nombre: str,
    descripcion: str,
    contenido_base64: str,
    tipo_documento: str,
    db: Session, # CORREGIDO: Tipado correcto para la sesión.
    visibilidad: str = "privado"
) -> int:
    """
    Registra un documento asociado a una inversión específica.
    """
    # Esta parte de la lógica para nombrar el archivo puede mantenerse si es necesaria.
    # timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    # nombre_unico = f"{timestamp}_{nombre}"
    # ruta_archivo_url = guardar_archivo(contenido_base64, nombre_unico)

    nuevo_doc = DocumentoProyecto(
        inversion_id=inversion_id, # Usando el parámetro correcto.
        nombre_documento=nombre, # Coincidiendo con el nombre de la columna en el modelo.
        descripcion_documento=descripcion, # Coincidiendo con el nombre de la columna.
        # url=ruta_archivo_url, # Descomentar si todavía guardas archivos físicos.
        contenido_base64=contenido_base64,
        tipo_documento=tipo_documento,
        visibilidad=visibilidad,
        creado_en=datetime.now() # Es mejor asignar el objeto datetime directamente.
    )
    
    db.add(nuevo_doc)
    db.commit()
    db.refresh(nuevo_doc)

    return nuevo_doc.id


def listar_documentos(proyecto_id: int, db: Session) -> list[dict]:
    """
    Lista todos los documentos de un proyecto específico, indicando si están firmados.
    Utiliza un estilo de consulta ORM moderno y legible.
    """

    # 1. Construir la consulta usando JOINs para filtrar y obtener datos relacionados.
    query = (
        db.query(
            DocumentoProyecto,
            # Se usa la existencia de una firma como indicador booleano.
            FirmaElectronica.id.isnot(None).label("firmado") 
        )
        # Hacemos un JOIN desde DocumentoProyecto a Inversion para poder filtrar por proyecto_id.
        .join(Inversion, DocumentoProyecto.inversion_id == Inversion.id)
        # Hacemos un OUTER JOIN a FirmaElectronica. Si no hay firma, los campos de FirmaElectronica serán NULL.
        .outerjoin(FirmaElectronica, DocumentoProyecto.id == FirmaElectronica.documento_id)
        # Filtramos por el proyecto_id que nos interesa.
        .filter(Inversion.proyecto_id == proyecto_id)
        .order_by(DocumentoProyecto.creado_en.desc())
    )
    
    # Ejecutamos la consulta. Cada 'resultado' será una tupla (Objeto DocumentoProyecto, booleano 'firmado')
    resultados_consulta = query.all()

    # 2. Construir la lista de diccionarios de forma segura y legible.
    documentos_lista = []
    for doc, firmado in resultados_consulta:
        documentos_lista.append({
            "id": doc.id,
            "nombre": doc.nombre_documento,
            "descripcion": doc.descripcion_documento,
            "url": doc.url,
            # No se recomienda devolver el base64 en una lista. Es muy pesado.
            # "contenidoBase64": doc.contenido_base64, 
            "tipo_documento": doc.tipo_documento,
            "visibilidad": doc.visibilidad,
            # El frontend espera 'creadoEn' en formato ISO.
            "creadoEn": doc.creado_en.isoformat() if doc.creado_en else None,
            "firmado": firmado
        })

    return documentos_lista

    
def get_documento_contenido(db: Session, documento_id: int) -> str | None:
    """
    Obtiene eficientemente solo el contenido en base64 de un documento por su ID.

    Retorna:
        str: El contenido en base64 si el documento existe.
        None: Si el documento no se encuentra.
    """
    # .query(models.DocumentoProyecto.contenido_base64): Selecciona únicamente la columna que necesitamos.
    # .filter(...): Busca por el ID del documento.
    # .scalar_one_or_none(): Ejecuta la consulta y devuelve el valor de la única columna de la primera fila,
    #                       o None si no se encuentra ningún resultado. Es la forma más eficiente para este caso.
    contenido = db.query(
        models.DocumentoProyecto.contenido_base64
    ).filter(
        models.DocumentoProyecto.id == documento_id
    ).scalar_one_or_none()
    
    return contenido

def firmar_documento(documento_id: int, db: Session):
    try:
        # Traer el contenido de base64
        contenido_base64 = get_documento_contenido(documento_id, db)
        # Decodificar y generar hash
        contenido_bytes = base64.b64decode(contenido_base64)
        document_hash = hashlib.sha256(contenido_bytes).hexdigest()

        # Simula firma en blockchain
        tx_hash = sign_document(document_hash)

        #Obtener el id de usuario
        inversor_id = session.query(Inversion.inversor_id)\
            .join(DocumentoProyecto, DocumentoProyecto.inversion_id == Inversion.id)\
            .filter(DocumentoProyecto.id == documento_id)\
            .scalar()

        # Guarda en base de datos con SQLAlchemy
        firma = FirmaElectronica(
            documento_id=documento_id,
            document_hash=document_hash,
            tx_hash=tx_hash,
            tipo_documento="contrato"  # Asumiendo que es un contrato, puedes cambiarlo si es necesario.
        )

        db.add(firma)
        db.commit()
        db.refresh(firma)

        return {"mensaje": "Documento firmado con éxito", "tx_hash": tx_hash}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

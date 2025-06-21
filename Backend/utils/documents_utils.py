import base64
import hashlib
import os
from datetime import datetime

from fastapi import HTTPException
from pydantic import BaseModel
from requests import Session, session
from blockchain.contract_utils import sign_document
from db import models
from db.conexion_db import get_db
from db.models import DocumentoProyecto, FirmaElectronica, Inversion
from sqlalchemy import select

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
    proyecto_id: int, # CORREGIDO: Se usa inversion_id para coincidir con el modelo.
    nombre: str,
    descripcion: str,
    contenido_base64: str,
    tipo_documento: str,
    inversor_id: int,
    db: Session, # CORREGIDO: Tipado correcto para la sesión.
    visibilidad: str = "privado",
) -> int:
    """
    Registra un documento asociado a una inversión específica.
    """
    # Esta parte de la lógica para nombrar el archivo puede mantenerse si es necesaria.
    # timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    # nombre_unico = f"{timestamp}_{nombre}"
    # ruta_archivo_url = guardar_archivo(contenido_base64, nombre_unico)

    #Crear nueva inversion ficticia para enlazar el documento.

    nueva_inversion = Inversion(
        proyecto_id=proyecto_id,  # Asumiendo que el proyecto_id es correcto.
        inversor_id=inversor_id,  # Asumiendo que el inversor_id es 1, deberías adaptarlo según tu lógica.
        monto_invertido=0.0,  # Asumiendo que el monto es 0, deberías adaptarlo según tu lógica.
        fecha_inversion=datetime.now(),  # Asignar la fecha actual.
        estado="pendiente"  # Asumiendo que el estado es "pendiente", deberías adaptarlo según tu lógica.
    )

    db.add(nueva_inversion)
    db.commit()
    db.refresh(nueva_inversion)
    inversion_id = nueva_inversion.id  # Obtener el ID de la nueva inversión creada.
    
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
            # No se recomienda devolver el base64 en una lista. Es muy pesado.
            # "contenidoBase64": doc.contenido_base64, 
            "tipo_documento": doc.tipo_documento,
            "visibilidad": doc.visibilidad,
            # El frontend espera 'creadoEn' en formato ISO.
            "creadoEn": doc.creado_en.isoformat() if doc.creado_en else None,
            "firmado": firmado
        })

    return documentos_lista


class DocumentoRequest(BaseModel):
    id: int
    inversion_id: int
    nombre_documento: str
    descripcion_documento: str
    contenido_base64: str
    tipo_documento: str
    creado_en: str
    firmado: bool
    visibilidad: str

def get_documento_por_inversion(inversion_id: int, db: Session) -> DocumentoProyecto | None:
    """
    Obtiene el contrato asociado a una inversión específica.

    Args:
        inversion_id (int): ID de la inversión para la cual se busca el contrato.
        db (Session): Sesión de base de datos.

    Returns:
        DocumentoProyecto | None: El documento del contrato si existe, o None si no se encuentra.
    """
    #Query para obtener el documento asociado a la inversión con DocumentoRequest
    stmt = (
        select(DocumentoProyecto)
        .where(DocumentoProyecto.inversion_id == inversion_id)
    )
    documentos = db.scalars(stmt).all()
    return [
        DocumentoRequest(
            id=doc.id,
            inversion_id=doc.inversion_id,
            nombre_documento=doc.nombre_documento,
            descripcion_documento=doc.descripcion_documento,
            contenido_base64=doc.contenido_base64,
            tipo_documento=doc.tipo_documento,
            creado_en=doc.creado_en.isoformat() if doc.creado_en else None,
            firmado=verificar_firma(doc.id, db),
            visibilidad=doc.visibilidad
        )
        for doc in documentos
    ]
    
def get_documento_contenido(db: Session, documento_id: int) -> str | None:
    """
    Obtiene eficientemente solo el contenido en base64 de un documento por su ID.

    Retorna:
        str: El contenido en base64 si el documento existe.
        None: Si el documento no se encuentra.
    """
    stmt = select(models.DocumentoProyecto.contenido_base64).where(
    models.DocumentoProyecto.id == documento_id
    )
    contenido = db.scalar(stmt)
    
    return contenido

def firmar_documento(documento_id: int, db: Session):
    try:
        # Traer el contenido de base64
        contenido_base64 = get_documento_contenido(db,documento_id)
        # Decodificar y generar hash
        contenido_bytes = base64.b64decode(contenido_base64)
        document_hash = hashlib.sha256(contenido_bytes).hexdigest()

        # Simula firma en blockchain
        tx_hash = sign_document(document_hash)

        #Obtener el id de usuario
        inversor_id = db.query(Inversion.inversor_id)\
            .join(DocumentoProyecto, DocumentoProyecto.inversion_id == Inversion.id)\
            .filter(DocumentoProyecto.id == documento_id)\
            .scalar()

        # Guarda en base de datos con SQLAlchemy
        firma = FirmaElectronica(
            documento_id=documento_id,
            firmado_en=datetime.now(),
            documento_hash=document_hash,
            tx_hash=tx_hash,
            tipo_documento="contrato"  # Asumiendo que es un contrato, puedes cambiarlo si es necesario.
        )

        db.add(firma)
        db.commit()
        db.refresh(firma)

        return {"mensaje": "Documento firmado con éxito", "tx_hash": tx_hash}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def copiar_contrato(inversion_id: int, db: Session):
    """
    Copia un contrato existente y lo registra como un nuevo documento.
    """
    #1. Obtener el ID del proyecto asociado a la inversión
    proyecto_id = db.query(Inversion.proyecto_id).filter(Inversion.id == inversion_id).scalar()
    if proyecto_id is None:
        raise ValueError("Inversión no encontrada")
    
     # 2. Obtener la inversión más antigua del proyecto (la primera)
    primera_inversion = db.query(Inversion).filter(
        Inversion.proyecto_id == proyecto_id
    ).order_by(Inversion.id.asc()).first()

    if primera_inversion is None:
        raise ValueError("No se encontraron inversiones para el proyecto")

    # 3. Obtener el primer documento asociado a esa inversión
    primer_documento = db.query(DocumentoProyecto).filter(
        DocumentoProyecto.inversion_id == primera_inversion.id
    ).order_by(DocumentoProyecto.id.asc()).first()

    if primer_documento is None:
        raise ValueError("No se encontraron documentos para la primera inversión")
    
    
    if not primer_documento:
        raise HTTPException(status_code=404, detail="Plantilla de contrato no encontrada")
    
    # Crear una copia del documento
    nuevo_documento = DocumentoProyecto(
        inversion_id=inversion_id,
        nombre_documento=f"Contrato #{proyecto_id}-{inversion_id}",
        descripcion_documento=primer_documento.descripcion_documento,
        contenido_base64=primer_documento.contenido_base64,
        tipo_documento=primer_documento.tipo_documento,
        visibilidad="público",  # Asignar visibilidad pública por defecto
        creado_en=datetime.now()  # Asignar la fecha actual
    )

    db.add(nuevo_documento)
    db.commit()
    db.refresh(nuevo_documento)

    return nuevo_documento.id  # Retornar el ID del nuevo documento creado


def verificar_firma(documento_id: int, db: Session) -> bool:
    """
    Verifica si un documento ha sido firmado.
    
    Args:
        documento_id (int): ID del documento a verificar.
        db (Session): Sesión de base de datos.

    Returns:
        bool: True si el documento está firmado, False en caso contrario.
    """
    firma = db.query(FirmaElectronica).filter(
        FirmaElectronica.documento_id == documento_id
    ).first()
    
    return firma is not None
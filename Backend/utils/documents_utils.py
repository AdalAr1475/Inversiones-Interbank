import base64
import os
from datetime import datetime

from requests import Session
from db.conexion_db import get_db
from db.models import DocumentoProyecto, FirmaElectronica

CARPETA_DOCUMENTOS = "archivos"

def guardar_archivo(contenido_base64, nombre_archivo):
    contenido_bytes = base64.b64decode(contenido_base64)

    if not os.path.exists(CARPETA_DOCUMENTOS):
        os.makedirs(CARPETA_DOCUMENTOS)

    ruta_archivo = os.path.join(CARPETA_DOCUMENTOS, nombre_archivo)

    with open(ruta_archivo, "wb") as f:
        f.write(contenido_bytes)

    return ruta_archivo  # puedes adaptar esto a una URL pública si estás sirviendo archivos con FastAPI/NGINX/etc.

def registrar_documento(proyecto_id: int, nombre: str, descripcion: str, contenido_base64: str, tipo_documento: str, visibilidad: str = "privado", db=None):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    nombre_archivo = f"{timestamp}_{nombre}"

    # Si aún necesitas guardar el archivo físicamente y tener una URL:
    ruta_archivo_url = guardar_archivo(contenido_base64, nombre_archivo)

    nuevo_doc = DocumentoProyecto(
        proyecto_id=proyecto_id,
        nombre=nombre,
        descripcion=descripcion,
        url=ruta_archivo_url,       # Se sigue guardando la URL (si aplica)
        contenido_base64=contenido_base64, # ¡NUEVO! Almacenar el contenido en base64
        tipo_documento=tipo_documento,
        visibilidad=visibilidad
    )
    db.add(nuevo_doc)
    db.commit()
    db.refresh(nuevo_doc)

    return nuevo_doc.id


def listar_documentos(proyecto_id: int, db: Session):
    documentos = (
        db.query(
            DocumentoProyecto.id,
            DocumentoProyecto.nombre,
            DocumentoProyecto.descripcion,
            DocumentoProyecto.url,
            DocumentoProyecto.contenido_base64, # ¡NUEVO! Seleccionar el contenido en base64
            DocumentoProyecto.tipo_documento,
            DocumentoProyecto.visibilidad,
            DocumentoProyecto.creado_en,
            # Subconsulta para verificar si el documento ha sido firmado
            db.query(FirmaElectronica)
              .filter(FirmaElectronica.documento_id == DocumentoProyecto.id)
              .exists()
              .label("firmado")
        )
        .filter(DocumentoProyecto.proyecto_id == proyecto_id)
        .order_by(DocumentoProyecto.creado_en.desc())
        .all()
    )

    resultado = [
        {
            "id": row[0],
            "nombre": row[1],
            "descripcion": row[2],
            "url": row[3],
            "contenidoBase64": row[4], # ¡NUEVO! Añadir al resultado, con el nombre que espera el frontend
            "tipo_documento": row[5],
            "visibilidad": row[6],
            "creadoEn": row[7].isoformat() if row[7] else None, # Corregido a 'creadoEn' para coincidir con frontend
            "firmado": row[8]
        }
        for row in documentos
    ]
    return resultado

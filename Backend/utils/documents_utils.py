import base64
import os
from datetime import datetime
from db.conexion_db import get_db

CARPETA_DOCUMENTOS = "archivos"

def guardar_archivo(contenido_base64, nombre_archivo):
    contenido_bytes = base64.b64decode(contenido_base64)

    if not os.path.exists(CARPETA_DOCUMENTOS):
        os.makedirs(CARPETA_DOCUMENTOS)

    ruta_archivo = os.path.join(CARPETA_DOCUMENTOS, nombre_archivo)

    with open(ruta_archivo, "wb") as f:
        f.write(contenido_bytes)

    return ruta_archivo  # puedes adaptar esto a una URL pública si estás sirviendo archivos con FastAPI/NGINX/etc.

def registrar_documento(proyecto_id, nombre, descripcion, contenido_base64):
    # Generar nombre de archivo único
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    nombre_archivo = f"{timestamp}_{nombre}"

    ruta = guardar_archivo(contenido_base64, nombre_archivo)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO Documentos_proyecto (proyecto_id, nombre, descripcion, url)
        VALUES (%s, %s, %s, %s)
        RETURNING id
    """, (proyecto_id, nombre, descripcion, ruta))
    documento_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    return documento_id

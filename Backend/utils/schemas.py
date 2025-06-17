# En tu archivo schemas.py

from pydantic import BaseModel

# ... otros esquemas

class DocumentoContenidoResponse(BaseModel):
    """
    Esquema de respuesta para el contenido de un documento en base64.
    """
    contenidoBase64: str

    class Config:
        # Permite que Pydantic funcione directamente con modelos ORM.
        orm_mode = True
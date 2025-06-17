# chat.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from db.conexion_db import get_db
from db.models import Mensaje, Usuario
from datetime import datetime
from typing import List, Dict
from sqlalchemy import or_, and_, desc

router = APIRouter()

active_connections: Dict[str, List[WebSocket]] = {}

def get_room_name(remitente_id: int, destinatario_id: int) -> str:
    return f"chat:{min(remitente_id, destinatario_id)}:{max(remitente_id, destinatario_id)}"

async def connect_to_room(room: str, websocket: WebSocket):
    await websocket.accept()
    if room not in active_connections:
        active_connections[room] = []
    active_connections[room].append(websocket)

def disconnect_from_room(room: str, websocket: WebSocket):
    if room in active_connections:
        active_connections[room].remove(websocket)
        if not active_connections[room]:
            del active_connections[room]

async def broadcast_to_room(room: str, message: dict):
    if room in active_connections:
        for connection in active_connections[room]:
            await connection.send_json(message)

@router.websocket("/ws/chat/{remitente_id}/{destinatario_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    remitente_id: int,
    destinatario_id: int,
    db: Session = Depends(get_db)          # ←  la sesión llega aquí
):
    room = get_room_name(remitente_id, destinatario_id)
    await connect_to_room(room, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            mensaje = data.get("mensaje")

            # ─── persistir ───
            nuevo = Mensaje(
                remitente_id=remitente_id,
                destinatario_id=destinatario_id,
                mensaje=mensaje,
                enviado_en=datetime.utcnow()
            )
            db.add(nuevo)
            db.commit()

            # ─── broadcast ───
            await broadcast_to_room(
                room,
                {
                    "remitente_id": remitente_id,
                    "destinatario_id": destinatario_id,
                    "mensaje": mensaje,
                    "enviado_en": nuevo.enviado_en.isoformat()
                }
            )
    except WebSocketDisconnect:
        disconnect_from_room(room, websocket)


# Ruta para obtener historial de mensajes entre dos usuarios
@router.get("/chat/historial/{usuario1_id}/{usuario2_id}")
def get_historial_mensajes(
    usuario1_id: int,
    usuario2_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene el historial de mensajes entre dos usuarios
    """
    mensajes = db.query(Mensaje).filter(
        or_(
            and_(Mensaje.remitente_id == usuario1_id, Mensaje.destinatario_id == usuario2_id),
            and_(Mensaje.remitente_id == usuario2_id, Mensaje.destinatario_id == usuario1_id)
        )
    ).order_by(Mensaje.enviado_en.asc()).all()
    
    return mensajes

# Ruta para obtener conversaciones de una empresa
@router.get("/chat/conversaciones/{empresa_id}")
def get_conversaciones_empresa(
    empresa_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las conversaciones (usuarios únicos) que han enviado mensajes a una empresa
    """
    # Subconsulta para obtener el último mensaje de cada usuario
    from sqlalchemy import func
    
    # Obtener usuarios únicos que han enviado mensajes a la empresa
    conversaciones = db.query(
        Mensaje.remitente_id.label('usuario_id'),
        Inversor.nombre_inversor.label('nombre_inversor'),
        Inversor.apellido_inversor.label('apellido_inversor'),
        func.max(Mensaje.enviado_en).label('fecha_ultimo_mensaje')
    ).join(
        Usuario, Usuario.id == Mensaje.remitente_id
    ).join(
        Inversor, Inversor.usuario_id == Usuario.id
    ).filter(
        Mensaje.destinatario_id == empresa_id,
        Mensaje.remitente_id != empresa_id  # Excluir mensajes de la propia empresa
    ).group_by(
        Mensaje.remitente_id, Inversor.nombre_inversor, Inversor.apellido_inversor
    ).order_by(
        desc(func.max(Mensaje.enviado_en))
    ).all()
    
    # Para cada conversación, obtener el último mensaje
    resultado = []
    for conv in conversaciones:
        ultimo_mensaje = db.query(Mensaje).filter(
            and_(
                Mensaje.remitente_id == conv.usuario_id,
                Mensaje.destinatario_id == empresa_id
            )
        ).order_by(desc(Mensaje.enviado_en)).first()
        
        resultado.append({
            "usuario_id": conv.usuario_id,
            "usuario_nombre": f"{conv.nombre_inversor} {conv.apellido_inversor}",
            "ultimo_mensaje": ultimo_mensaje.mensaje if ultimo_mensaje else "",
            "fecha_ultimo_mensaje": conv.fecha_ultimo_mensaje.isoformat() if conv.fecha_ultimo_mensaje else ""
        })
    
    return resultado

# Ruta para obtener información básica de un usuario
@router.get("/usuario/{usuario_id}")
def get_usuario_info(
    usuario_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene información básica de un usuario
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        return {"error": "Usuario no encontrado"}
    
    # Buscar información del inversor si existe
    inversor = db.query(Inversor).filter(Inversor.usuario_id == usuario_id).first()
    nombre_completo = f"{inversor.nombre_inversor} {inversor.apellido_inversor}" if inversor else "Usuario"
    
    return {
        "id": usuario.id,
        "nombre": nombre_completo,
        "email": usuario.email,
        "tipo_usuario": usuario.tipo_usuario
    }

# Ruta para limpiar usuarios ficticios (solo para desarrollo)
@router.delete("/limpiar-usuarios-ficticios")
def limpiar_usuarios_ficticios(
    db: Session = Depends(get_db)
):
    """
    Elimina mensajes de usuarios ficticios (12, 13, 14) de la base de datos
    Solo para desarrollo/testing
    """
    usuarios_ficticios = [12, 13, 14]
    
    # Eliminar mensajes de usuarios ficticios
    mensajes_eliminados = db.query(Mensaje).filter(
        or_(
            Mensaje.remitente_id.in_(usuarios_ficticios),
            Mensaje.destinatario_id.in_(usuarios_ficticios)
        )
    ).delete()
    
    db.commit()
    
    return {
        "mensaje": f"Se eliminaron {mensajes_eliminados} mensajes de usuarios ficticios",
        "usuarios_eliminados": usuarios_ficticios
    }

# Ruta para obtener historial de mensajes entre dos usuarios
@router.get("/chat/historial/{usuario1_id}/{usuario2_id}")
def get_historial_mensajes(
    usuario1_id: int,
    usuario2_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene el historial de mensajes entre dos usuarios
    """
    mensajes = db.query(Mensaje).filter(
        or_(
            and_(Mensaje.remitente_id == usuario1_id, Mensaje.destinatario_id == usuario2_id),
            and_(Mensaje.remitente_id == usuario2_id, Mensaje.destinatario_id == usuario1_id)
        )
    ).order_by(Mensaje.enviado_en.asc()).all()
    
    return mensajes
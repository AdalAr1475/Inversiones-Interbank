from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.stripe_utils import create_stripe_customer, create_connected_account
from utils.db_wallet_utils import crear_wallet
import db.models as models
from config_token.authenticate import get_hashed_password
from db.conexion_db import get_db, engine
from funciones import validar_dni
router = APIRouter()

class UsuarioCreate(BaseModel):
    nombre: str
    apellido_paterno: str
    apellido_materno: str
    dni: str
    telefono: str
    email: str
    password: str
    tipo_usuario: str

models.Base.metadata.create_all(bind=engine)
db_dependency = Annotated[Session, Depends(get_db)]

# Crear un nuevo inversor
@router.post("/create", tags=["auth"])
async def create_inversor(db: db_dependency, user: UsuarioCreate):

    usuario = db.query(models.Usuario).filter(models.Usuario.email==user.email).first()
    if usuario:
        raise HTTPException(detail="El email ya está registrado")
    
    if not validar_dni(user.dni):
        raise HTTPException(detail="Ingrese un dni valido")
    
    password_hash = get_hashed_password(user.password)

    new_usuario = models.Usuario(
        nombre = user.nombre,
        apellido_paterno = user.apellido_paterno,
        apellido_materno = user.apellido_materno,
        dni = user.dni,
        telefono = user.telefono,
        email = user.email,
        password_hash = password_hash,
        tipo_usuario = user.tipo_usuario
    )

    create_stripe_customer("CLIENTE {}".format(new_usuario.id), new_usuario.email)
    db.add(new_usuario)

    crear_wallet(new_usuario.id, db) 
    db.commit()

    db.refresh(new_usuario)

    return JSONResponse( 
        content={
            "message": "Inversor creado exitosamente"
        }
    )

# Consulta de los usuarios en la base de datos, con logearse con cualquier cuenta (inversor, empresa, admin) funciona
@router.get("/get-usuarios", tags=["auth"])
async def get_usuarios(db: db_dependency):
    db_usuarios = db.query(models.Usuario).all()

    response = []
    for user in db_usuarios:
        response.append({
            "id": user.id,
            "nombre": db.query(models.Inversor).filter(models.Inversor.usuario_id == user.id).first().nombre_inversor if user.tipo_usuario == "inversor" else db.query(models.Empresa).filter(models.Empresa.usuario_id == user.id).first().nombre_empresa,
            "email": user.email,
            "tipo_usuario": user.tipo_usuario,
            "password_hash": user.password_hash
            
        })

    return JSONResponse(status_code=200,content=response)

# Obtener datos de un inversor por ID del Usuario
@router.get("/get-inversor/{usuario_id}")
async def get_inversor(usuario_id: int, db: db_dependency):

    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Inversor no encontrado")

    inversor = db.query(models.Inversor).filter(models.Inversor.usuario_id == usuario_id).first()
    if not inversor:
        raise HTTPException(status_code=404, detail="Inversor no encontrado")

    return JSONResponse(
        status_code=200,
        content={
            "id": inversor.id,
            "nombre_inversor": inversor.nombre_inversor,
            "apellido_inversor": inversor.apellido_inversor,
            "dni": inversor.dni,
            "telefono": inversor.telefono,
            "experiencia": inversor.experiencia,
            "pais": inversor.pais,
            "email": usuario.email
        }
    )
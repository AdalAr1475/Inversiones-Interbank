from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.stripe_utils import create_stripe_customer, create_connected_account, create_account_onboarding_link
from utils.db_wallet_utils import crear_wallet
import db.models as models
from config_token.authenticate import get_hashed_password
from db.conexion_db import get_db, engine
from funciones import validar_dni, validar_numero
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

@router.post("/create", tags=["auth"])
async def create(db: db_dependency, user: UsuarioCreate):

    usuario = db.query(models.Usuario).filter(models.Usuario.email==user.email.lower()).first()
    if usuario:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    dni = db.query(models.Usuario).filter(models.Usuario.dni==user.dni).first()
    if dni:
        raise HTTPException(
            status_code=400,
            detail="El dni ya se encuentra registrado"
        )
    
    if not validar_dni(user.dni):
        raise HTTPException(
            status_code=400,
            detail="Ingrese un dni valido"
        )
    
    if not validar_numero(user.telefono):
        raise HTTPException(
            status_code=400,
            detail="Ingrese un numero valido"
        )

    password_hash = get_hashed_password(user.password)

    new_usuario = models.Usuario(
        nombre = user.nombre.capitalize(),
        apellido_paterno = user.apellido_paterno.capitalize(),
        apellido_materno = user.apellido_materno.capitalize(),
        dni = user.dni,
        telefono = user.telefono,
        email = user.email.lower(),
        password_hash = password_hash,
        tipo_usuario = user.tipo_usuario.lower()
    )

    db.add(new_usuario) 
    db.commit()
    db.refresh(new_usuario)

    if(new_usuario.tipo_usuario=="inversor"):
        crear_wallet(new_usuario.id, db)
        create_stripe_customer(new_usuario.nombre, new_usuario.email)
        return JSONResponse(
            content={
                "message": "Inversor creado exitosamente"
            }
        )

    elif(new_usuario.tipo_usuario=="emprendedor"):
        response = create_connected_account(new_usuario.email, "individual", "US")
        new_usuario.stripe_account_id = response["id"]
        new_usuario.estado = "inactivo"
        db.add(new_usuario)
        db.commit()
        return JSONResponse( 
            content={
                "message": "Emprendedor creado exitosamente",
                "link": create_account_onboarding_link(response["id"], "http://localhost:3000", "http://localhost:3000"),
            }
        )

# Consulta de los usuarios en la base de datos, con logearse con cualquier cuenta (inversor, empresa, admin) funciona
@router.get("/get-users", tags=["auth"])
async def get_usuarios(db: db_dependency, tipo_usuario: Optional[str] = None):

    if tipo_usuario:
        users = db.query(models.Usuario).filter(models.Usuario.tipo_usuario == tipo_usuario).all()
    else:
        users = db.query(models.Usuario).all()

    response = []
    for user in users:
        response.append({
            "nombre": user.nombre,
            "apellido_paterno": user.apellido_paterno,
            "apellido_materno": user.apellido_materno,
            "dni": user.dni,
            "telefono": user.telefono,
            "email": user.email,
            "tipo_usuario": user.tipo_usuario
        })

    return JSONResponse(status_code=200,content=response)
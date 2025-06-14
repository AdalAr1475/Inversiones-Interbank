from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

import db.models as models
from config_token.authenticate import get_hashed_password
from db.conexion_db import get_db, engine
from funciones import validar_dni, validar_ruc
router = APIRouter()

class UsuarioCreateInversor(BaseModel):
    email: str
    password: str
    nombre_inversor: str
    apellido_inversor: str
    dni: str
    telefono: str
    experiencia: str
    dni: str
    pais: str

class UsuarioCreateEmpresa(BaseModel):
    email: str
    password: str
    nombre_empresa: str
    ruc: str
    descripcion: str
    sector: str
    ubicacion: str

class Usuario(BaseModel):
    nombre: str
    email: str
    password: str

models.Base.metadata.create_all(bind=engine)
db_dependency = Annotated[Session, Depends(get_db)]

# Crear un nuevo inversor
@router.post("/create-inversor", tags=["auth"])
async def create_inversor(db: db_dependency, user: UsuarioCreateInversor):

    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email==user.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    if not validar_dni(user.dni):
        raise HTTPException(status_code=400, detail="Ingrese un dni valido")
    
    password_hash = get_hashed_password(user.password)

    new_usuario = models.Usuario(
        email = user.email,
        password_hash = password_hash,
        tipo_usuario = "inversor"
    )

    db.add(new_usuario)
    db.commit()

    new_inversor = models.Inversor(
        usuario_id = new_usuario.id,
        nombre_inversor = user.nombre_inversor,
        apellido_inversor = user.apellido_inversor,
        dni = user.dni,
        telefono = user.telefono,
        experiencia = user.experiencia,
        pais = user.pais
    )

    db.add(new_inversor)
    db.commit()
    db.refresh(new_usuario)
    db.refresh(new_inversor)

    return JSONResponse(
        status_code=201, 
        content={
            "message": "Inversor creado exitosamente"
        }
    )

# Crear una nueva empresa, se necesita logearse con una permisos de admin
@router.post("/create-empresa", tags=["auth"])
async def create_empresa(db: db_dependency, user: UsuarioCreateEmpresa):

    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email==user.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    empresa_existente = db.query(models.Empresa).filter(models.Empresa.ruc==user.ruc).first()
    if empresa_existente:
        raise HTTPException(status_code=400, detail="El ruc ya se encuentra registrado")
    
    usuario_existente = db.query(models.Empresa).filter(models.Empresa.nombre_empresa==user.nombre_empresa).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El nombre ingresado ya se encuentra registrado")
    
    """
    if not validar_ruc(user.ruc):
        raise HTTPException(status_code=400, detail="Ingresar un ruc valido")
    """

    password_hash = get_hashed_password(user.password)

    new_usuario = models.Usuario(
        email=user.email,
        password_hash=password_hash,
        tipo_usuario="empresa"
    )

    db.add(new_usuario)
    db.commit()

    new_empresa = models.Empresa(
        usuario_id=new_usuario.id,
        nombre_empresa=user.nombre_empresa,
        ruc=user.ruc,
        descripcion=user.descripcion,
        sector=user.sector,
        ubicacion=user.ubicacion,
    )

    db.add(new_empresa)
    db.commit()
    db.refresh(new_usuario)
    db.refresh(new_empresa)

    return JSONResponse(
        status_code=201, 
        content={
            "message": "Empresa creada exitosamente"
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
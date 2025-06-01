from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from Backend import models
from Backend.JWT.authenticate import check_admin, get_current_user, get_hashed_password
from Backend.database import get_db, engine
from Backend.funciones import validar_dni, validar_ruc

router = APIRouter()

class Usuario(BaseModel):
    nombre: str
    email: str

class UsuarioCreateInversor(Usuario):
    password: str
    dni: str
    pais: str

class UsuarioCreateEmpresa(Usuario):
    password: str
    ruc: str
    descripcion: str
    sector: str
    pais: str

class Usuario(BaseModel):
    nombre: str
    email: str
    password: str

models.Base.metadata.create_all(bind=engine)

db_dependency = Annotated[Session, Depends(get_db)]


# Crear un nuevo inversor, se necesita permisos de admin
@router.post("/inversor", response_model=None, tags=["Admin"], dependencies=[Depends(check_admin)])
async def create_inversor(db: db_dependency, user: UsuarioCreateInversor):

    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email==user.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    if not validar_dni(user.dni):
        raise HTTPException(status_code=400, detail="Ingrese un dni valido")
    
    password_hash = get_hashed_password(user.password)

    new_usuario = models.Usuario(
        email = user.email,
        nombre = user.nombre,
        password_hash = password_hash,
        tipo_usuario = "inversor"
    )

    db.add(new_usuario)
    db.commit()

    new_inversor = models.Inversor(
        usuario_id = new_usuario.id,
        dni = user.dni,
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
@router.post("/empresa", tags=["Admin"], dependencies=[Depends(check_admin)])
async def create_empresa(db: db_dependency, user: UsuarioCreateEmpresa):

    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email==user.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    empresa_existente = db.query(models.Empresa).filter(models.Empresa.ruc==user.ruc).first()
    if empresa_existente:
        raise HTTPException(status_code=400, detail="El ruc ya se encuentra registrado")
    
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.nombre==user.nombre).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El nombre ingresado ya se encuentra registrado")
    
    if not validar_ruc(user.ruc):
        raise HTTPException(status_code=400, detail="Ingresar un ruc valido")

    password_hash = get_hashed_password(user.password)

    new_usuario = models.Usuario(
        email=user.email,
        nombre=user.nombre,
        password_hash=password_hash,
        tipo_usuario="empresa"
    )

    db.add(new_usuario)
    db.commit()

    new_empresa = models.Empresa(
        usuario_id=new_usuario.id,
        ruc=user.ruc,
        descripcion=user.descripcion,
        sector=user.sector,
        pais=user.pais
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

# Crear un nuevo admin, este eddponit no tiene autenticación para que puedan crear un correo y contraseña para logearte.
# Una vez que ya crearon uno poner al costado de tags=["admin"] -> dependencies=[Depends(check_admin)]
@router.post("/admin", tags=["Admin"])
async def create_admin(db: db_dependency, user: Usuario):

    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email==user.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.nombre == user.nombre).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El nombre ingresado ya esta en uso")

    password_hash = get_hashed_password(user.password)

    new_usuario = models.Usuario(
        email=user.email,
        nombre=user.nombre,
        password_hash=password_hash,
        tipo_usuario="admin"
    )

    db.add(new_usuario)
    db.commit()
    db.refresh(new_usuario)

    return JSONResponse(
        status_code=201,
        content={
            "message": "La cuenta admin se creo correctamente"
        }
    )

# Consulta de los usuarios en la base de datos, con logearse con cualquier cuenta (inversor, empresa, admin) funciona
@router.get("/usuarios", dependencies=[Depends(get_current_user)], tags=["Autenticación"])
async def get_usuarios(db: db_dependency):
    db_usuarios = db.query(models.Usuario).all()

    response = []
    for user in db_usuarios:
        response.append({
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email
        })

    return JSONResponse(status_code=200,content=response)
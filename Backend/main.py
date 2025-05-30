from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Annotated
from authenticate import authenticate_user, check_admin_role, create_token, get_hashed_password, check_investor_role, admin_or_investor_role
from database import engine, get_db
from sqlalchemy.orm import Session
import models
#Blockchain imports
import hashlib
from blockchain.contract_utils import sign_document, is_signed

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

# Definimos el modelo de datos para crear un usuario
class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    email: str
    password: str
    rol: str

# Dependencia para la sesión de la base de datos
db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/token") 
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db=db, email=form_data.username, password=form_data.password)
    access_token = create_token({"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/roles", tags=["Publico"])
async def get_roles(db: db_dependency):
    # Obtener todos los roles de la base de datos
    db_roles = db.query(models.Rol).all()
    return db_roles

@app.get("/usuario", tags=["Usuario"])
async def get_usuario(db: db_dependency, user: models.Usuario = Depends(admin_or_investor_role)):

    rol_name = db.query(models.Rol).filter(models.Rol.id == user.id_rol).first().nombre

    return JSONResponse(
        status_code=200,
        content={
            "message": "Usuario autenticado",
            "usuario": {
                "id": user.id,
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "rol": rol_name
            }
        }
    )

@app.get("/admin", tags=["admin"])
async def get_admin(db: db_dependency, user: models.Usuario = Depends(check_admin_role)):

    rol_name = db.query(models.Rol).filter(models.Rol.id == user.id_rol).first().nombre

    return JSONResponse(
        status_code=200,
        content={
            "mensaje": "Admin autenticado",
            "usuario": {
                "id": user.id,
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "rol": rol_name
            }
        }
    )

@app.get("/usuarios", tags=["admin"], dependencies=[Depends(check_admin_role)])
async def get_usuarios(db: db_dependency):
    # Obtener todos los usuarios de la base de datos
    db_usuarios = db.query(models.Usuario).all()
    return db_usuarios

@app.get("/usuario/{id_usuario}", tags=["admin"], dependencies=[Depends(check_admin_role)]) 
async def get_usuario(id_usuario: int, db: db_dependency):
    # Obtener un usuario específico por ID
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == id_usuario).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_usuario

@app.post("/usuario", tags=["Publico"])
async def create_usuario(usuario: UsuarioCreate, db: db_dependency):
    
    # Verificar si el rol existe
    db_rol = db.query(models.Rol).filter(models.Rol.nombre == usuario.rol).first()
    if not db_rol:
        raise HTTPException(status_code=400, detail="Rol no encontrado")
    
    # Verificar si el email ya está en uso
    db_email = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="El email ya está en uso")

    # Crear el nuevo usuario
    hashed_password = get_hashed_password(usuario.password)
    
    new_usuario = models.Usuario(
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        email=usuario.email,
        password_hash=hashed_password,
        id_rol=db_rol.id
    )

    db.add(new_usuario)
    db.commit()
    db.refresh(new_usuario)
    return JSONResponse(
        status_code=201, 
        content={
            "message": "Usuario creado exitosamente", 
            "usuario":
            {
                "id": new_usuario.id,
                "nombre": new_usuario.nombre,
                "apellido": new_usuario.apellido,
                "email": new_usuario.email,
                "rol": db_rol.nombre
            }
        }
    )


# BLOCKCHAIN ENDPOINTS

def hash_document(file_bytes):
    return '0x' + hashlib.sha256(file_bytes).hexdigest()

@app.post("/sign-document/")
async def sign(file: UploadFile = File(...)):
    contents = await file.read()
    doc_hash = hash_document(contents)
    tx = sign_document(doc_hash)
    return {"message": "Documento firmado", "tx_hash": tx}

@app.post("/verify-document/")
async def verify(file: UploadFile = File(...)):
    contents = await file.read()
    doc_hash = hash_document(contents)
    signed = is_signed(doc_hash)
    return {"hash": doc_hash, "signed": signed}
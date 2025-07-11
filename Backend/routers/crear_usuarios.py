from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.stripe_utils import create_stripe_customer, create_connected_account, create_account_onboarding_link
from utils.db_wallet_utils import crear_wallet
import db.models as models
from config_token.authenticate import get_hashed_password, get_current_user
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
        db.refresh(new_usuario)

        return_url = f"http://localhost:3000/dashboard/emprendedor?success=true&user_id={new_usuario.id}"
        refresh_url = f"http://localhost:3000/dashboard/emprendedor?refresh=true&user_id={new_usuario.id}" # O una URL específica para refrescar
        
        onboarding_link = create_account_onboarding_link(
            response["id"], 
            return_url, 
            refresh_url
        )

        return JSONResponse( 
            content={
                "message": "Emprendedor creado exitosamente",
                "link": onboarding_link,
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

@router.get("/activate-account")
async def activate_user_account(
    user_id: str = Query(..., description="ID del usuario a activar"),
    success: bool = Query(..., description="Indica si la activación fue exitosa"),
    db: Session = Depends(get_db)
):
    if not success:
        raise HTTPException(status_code=400, detail="La activación de la cuenta no fue exitosa.")

    user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    if user.estado == "activo":
        return {"message": "La cuenta ya está activa."}

    user.estado = "activo"
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Cuenta activada exitosamente."}

@router.get("/get-inversor/{idUsuario}", tags=["auth"])
async def get_inversor_profile(
    idUsuario: int,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene el perfil completo de un inversor por su ID.
    Requiere autenticación válida.
    """
    try:
        # Buscar el usuario por ID y verificar que sea un inversor
        usuario = db.query(models.Usuario).filter(
            models.Usuario.id == idUsuario,
            models.Usuario.tipo_usuario == "inversor"
        ).first()
        
        if not usuario:
            raise HTTPException(
                status_code=404, 
                detail="Inversor no encontrado"
            )
        
        # Construir el perfil del inversor según el tipo InversorProfile
        perfil_inversor = {
            "id": usuario.id,
            "nombre_inversor": usuario.nombre,
            "apellido_inversor": f"{usuario.apellido_paterno} {usuario.apellido_materno}".strip(),
            "dni": usuario.dni,
            "telefono": usuario.telefono,
            "experiencia": getattr(usuario, 'experiencia', 'Sin especificar'),  # Campo opcional
            "pais": getattr(usuario, 'pais', 'Sin especificar'),  # Campo opcional
            "email": usuario.email
        }
        
        return JSONResponse(
            status_code=200,
            content=perfil_inversor
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

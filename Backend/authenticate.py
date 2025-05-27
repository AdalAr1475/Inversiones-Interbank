from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from database import get_db
import bcrypt
import models

SECRET_KEY = "clave_secreta"
ALGORITHM = "HS256"

# Definimos el modelo de datos para la autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Funciones para manejar la autenticación y autorización de usuarios

# Función para hashear la contraseña
def get_hashed_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Función para verificar la contraseña
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Función para autenticar al usuario
def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="El email no existe",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Contraseña incorrecta",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Función para crear un token JWT
def create_token(data: dict, time_expire: timedelta = None):
    data_copy = data.copy()
    expire = datetime.now(timezone.utc) + (time_expire or timedelta(minutes=15))
    data_copy.update({"exp": expire})
    return jwt.encode(data_copy, key=SECRET_KEY, algorithm=ALGORITHM)

# Función para decodificar el token y obtener el payload
def decode_token(token: str):
    try:
        payload = jwt.decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Función para validar el token y obtener el usuario actual
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Roles de usuario

# Dependencia para verificar si el usuario tiene rol de administrador
def check_admin_role(user: models.Usuario = Depends(get_current_user)):
    if user.id_rol != 1:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Dependencia para verificar si el usuario tiene rol de inversor
def check_investor_role(user: models.Usuario = Depends(get_current_user)):
    if user.id_rol != 2:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Dependencia para verificar si el usuario tiene rol de administrador o inversor
def admin_or_investor_role(user: models.Usuario = Depends(get_current_user)):
    if user.id_rol not in [1, 2]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
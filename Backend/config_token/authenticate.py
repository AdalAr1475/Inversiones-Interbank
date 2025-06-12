from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from db.conexion_db import get_db
import bcrypt
import db.models as models

SECRET_KEY = "MI_CLAVE_SECRETA"
ALGORITHM = "HS256"

# Definimos el modelo de datos para la autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Funciones para manejar la autenticación y autorización de usuarios

# Función para hashear la contraseña
def get_hashed_password(password_textplano: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_textplano.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Función para verificar la contraseña
def verify_password(password_textplano: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password_textplano.encode('utf-8'), hashed_password.encode('utf-8'))

# Función para autenticar al usuario
def authenticate_user(db: Session, email: str, password_textplano: str):
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="El email no existe",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(password_textplano, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Contraseña incorrecta",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Función para crear un token JWT
def create_token(datos: dict, time_expire: timedelta = None):
    datos_copia = datos.copy()
    now = datetime.now(timezone.utc)
    expire = now + (time_expire or timedelta(minutes=1))
    datos_copia.update({"exp": int(expire.timestamp())})
    token = jwt.encode(datos_copia, key=SECRET_KEY, algorithm=ALGORITHM)
    return token

# Función para decodificar el token y obtener los datos
def decode_token(token: str):
    try:
        datos = jwt.decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
        return datos
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
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
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Funcion para autenticar a la cuenta inversor
def check_inversor(user: models.Usuario = Depends(get_current_user)):
    if user.tipo_usuario != "inversor":
        raise HTTPException(status_code=403, detail="No tienes permisos suficientes")
    return user

# Funcion para autenticar a la cuenta empresa
def check_empresa(user: models.Usuario = Depends(get_current_user)):
    if user.tipo_usuario != "empresa":
        raise HTTPException(status_code=403, detail="No tienes permisos suficientes")
    return user
    
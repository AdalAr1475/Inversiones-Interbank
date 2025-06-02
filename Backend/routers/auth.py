
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from jwt.authenticate import authenticate_user, create_token
from db.conexion_db import get_db

router = APIRouter()

@router.post("/token") 
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db=db, email=form_data.username, password_textplano=form_data.password)
    if not user:
        raise HTTPException(status_code="400", detail="Credenciales incorrectas")
    access_token = create_token({"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
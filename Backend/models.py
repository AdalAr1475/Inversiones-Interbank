from sqlalchemy import TIMESTAMP, Column, Integer, String, ForeignKey, func
from database import Base

class Rol(Base):
    __tablename__ = 'rol'

    id = Column(Integer, primary_key=True)
    nombre = Column(String(20), unique=True, nullable=False)

class Usuario(Base):
    __tablename__ = 'usuario'

    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    id_rol = Column(Integer, ForeignKey('rol.id'), nullable=False)
    fecha_registro = Column(TIMESTAMP, server_default=func.current_timestamp())
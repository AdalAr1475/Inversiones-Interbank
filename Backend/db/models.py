from datetime import datetime
from sqlalchemy import (
    TIMESTAMP, Column, Integer, String, Text, Numeric, DateTime, func,
    ForeignKey, CHAR, Enum, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
 
    # Columnas
    id = Column(Integer, primary_key=True)
    nombre = Column(String(255), nullable=False)
    apellido_paterno = Column(String(255), nullable=False)
    apellido_materno = Column(String(255), nullable=False)
    dni = Column(CHAR(8), unique=True, nullable=False)
    telefono = Column(CHAR(9), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    tipo_usuario = Column(
        Enum('emprendedor', 'inversor', name='tipo_usuario_enum'), 
        nullable=False
    )
    creado_en = Column(TIMESTAMP, server_default=func.current_timestamp())
    stripe_account_id = Column(String(255), nullable=True)

    # Relaciones
    wallets = relationship("Wallet", back_populates="inversor", cascade="all, delete-orphan")
    recargas = relationship("RecargaWallet", back_populates="inversor", cascade="all, delete-orphan")
    proyectos = relationship("Proyecto", back_populates="emprendedor", cascade="all, delete-orphan")
    inversiones = relationship("Inversion", back_populates="inversor", cascade="all, delete-orphan")
    mensajes_enviados = relationship(
        "Mensaje", 
        back_populates="remitente", 
        foreign_keys="[Mensaje.remitente_id]",
        cascade="all, delete-orphan"
    )
    mensajes_recibidos = relationship(
        "Mensaje", 
        back_populates="destinatario", 
        foreign_keys="[Mensaje.destinatario_id]",
        cascade="all, delete-orphan"
    )

class Wallet(Base):
    __tablename__ = "wallets"

    # Columnas
    id = Column(Integer, primary_key=True)
    inversor_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    saldo = Column(Numeric(12, 2), default=0.00)
    actualizado_en = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relaciones
    inversor = relationship("Usuario", back_populates="wallets")

class RecargaWallet(Base):
    __tablename__ = "recargas_wallet"

    # Columnas
    id = Column(Integer, primary_key=True)
    inversor_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    stripe_payment_intent = Column(String(255))
    monto = Column(Numeric(12, 2), nullable=False)
    estado = Column(
        Enum('Real', 'Simulado', name='estado_recarga_enum'), 
        default='Simulado'
    )
    fecha_recarga = Column(TIMESTAMP, server_default=func.current_timestamp())

    # Relaciones
    inversor = relationship("Usuario", back_populates="recargas")

class Proyecto(Base):
    __tablename__ = "proyectos"

    # Columnas
    id = Column(Integer, primary_key=True)
    emprendedor_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    nombre_proyecto = Column(String(255), nullable=False)
    descripcion = Column(String(255), nullable=False)
    descripcion_extendida = Column(Text, nullable=False)
    sector = Column(String(255), nullable=False)
    ubicacion = Column(String(255), nullable=False)
    monto_pedido = Column(Numeric(12, 2), nullable=False)
    monto_recaudado = Column(Numeric(12, 2), nullable=False)
    retorno_estimado = Column(Numeric(8, 2), nullable=False)
    fecha_inicio = Column(TIMESTAMP, server_default=func.current_timestamp())
    fecha_fin = Column(TIMESTAMP, nullable=False)
    estado = Column(
        Enum('activo', 'completado', 'cancelado', name='estado_proyecto_enum'), 
        default='activo',
        nullable=False
    )

    # Relaciones
    emprendedor = relationship("Usuario", back_populates="proyectos")
    inversiones = relationship("Inversion", back_populates="proyecto", cascade="all, delete-orphan")

class Inversion(Base):
    __tablename__ = "inversiones"

    # Columnas
    id = Column(Integer, primary_key=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id", ondelete="CASCADE"))
    inversor_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    monto_invertido = Column(Numeric(12, 2), nullable=False)
    fecha_inversion = Column(TIMESTAMP, server_default=func.current_timestamp())
    estado = Column(
        Enum('pendiente', 'firmado', 'rechazado', name='estado_inversion_enum'), 
        default='pendiente'
    )

    # Relaciones
    proyecto = relationship("Proyecto", back_populates="inversiones")
    inversor = relationship("Usuario", back_populates="inversiones")
    documentos = relationship("DocumentoProyecto", back_populates="inversion", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="inversion", cascade="all, delete-orphan")

class DocumentoProyecto(Base):
    __tablename__ = "documentos_proyecto"

    # Columnas
    id = Column(Integer, primary_key=True)
    inversion_id = Column(Integer, ForeignKey("inversiones.id", ondelete="CASCADE"))
    nombre_documento = Column(String(255), nullable=False)
    descripcion_documento = Column(Text, nullable=False)
    url = Column(Text, nullable=False)
    contenido_base64 = Column(Text)
    tipo_documento = Column(String(50), nullable=False)
    creado_en = Column(TIMESTAMP, server_default=func.current_timestamp())
    visibilidad = Column(
        Enum('público', 'privado', name='visibilidad_enum'), 
        default='privado'
    )

    # Relaciones
    inversion = relationship("Inversion", back_populates="documentos")
    firmas = relationship("FirmaElectronica", back_populates="documento", cascade="all, delete-orphan")

class FirmaElectronica(Base):
    __tablename__ = "firmas_electronicas"

    # Columnas
    id = Column(Integer, primary_key=True)
    documento_id = Column(Integer, ForeignKey("documentos_proyecto.id", ondelete="CASCADE"))
    firmado_en = Column(TIMESTAMP, nullable=False)
    documento_hash = Column(Text)
    tx_hash = Column(Text)
    tipo_documento = Column(String(50), nullable=False)

    # Relaciones
    documento = relationship("DocumentoProyecto", back_populates="firmas")

class Pago(Base):
    __tablename__ = "pagos"

    # Columnas
    id = Column(Integer, primary_key=True, nullable=False)
    inversion_id = Column(Integer, ForeignKey("inversiones.id", ondelete="CASCADE"))
    stripe_payment_id = Column(String(255), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    estado = Column(
        Enum('exitoso', 'fallido', 'pendiente', name='estado_pago_enum')
    )
    fecha_pago = Column(TIMESTAMP, server_default=func.current_timestamp())

    # Relaciones
    inversion = relationship("Inversion", back_populates="pagos")

class Mensaje(Base):
    __tablename__ = "mensajes"

    # Columnas
    id = Column(Integer, primary_key=True)
    remitente_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    destinatario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    mensaje = Column(Text, nullable=False)
    enviado_en = Column(TIMESTAMP, server_default=func.current_timestamp())

    # Relaciones
    remitente = relationship("Usuario", back_populates="mensajes_enviados", foreign_keys=[remitente_id])
    destinatario = relationship("Usuario", back_populates="mensajes_recibidos", foreign_keys=[destinatario_id])
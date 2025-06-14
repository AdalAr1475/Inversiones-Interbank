from sqlalchemy import (
    TIMESTAMP, Column, Integer, String, Text, Numeric, Date, DateTime,
    ForeignKey, CheckConstraint, Boolean, func
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
 
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    tipo_usuario = Column(String(20), nullable=False)
    wallet_address = Column(Text)
    creado_en = Column(DateTime(timezone=True), server_default=func.now()) 

    __table_args__ = (
        CheckConstraint(
            tipo_usuario.in_(['empresa', 'inversor']),
            name="ck_tipo_usuario_valid"
        ),
    )

    empresas = relationship("Empresa", back_populates="usuario", cascade="all, delete")
    inversores = relationship("Inversor", back_populates="usuario", cascade="all, delete")
    mensajes_remitentes = relationship("Mensaje", foreign_keys="[Mensaje.remitente_id]", back_populates="remitente")
    mensajes_destinatarios = relationship("Mensaje", foreign_keys="[Mensaje.destinatario_id]", back_populates="destinatario")
    firmas = relationship("FirmaElectronica", back_populates="usuario")


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    nombre_empresa = Column(String(255), nullable=False)
    ruc = Column(String(20), unique=True, nullable=False)
    descripcion = Column(Text)
    sector = Column(String(20), nullable=False)
    ubicacion = Column(String(100), nullable=True)

    usuario = relationship("Usuario", back_populates="empresas")
    proyectos = relationship("ProyectoInversion", back_populates="empresa", cascade="all, delete-orphan")


class Inversor(Base):
    __tablename__ = "inversores"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    nombre_inversor = Column(String(255), nullable=False)
    apellido_inversor = Column(String(255), nullable=False)
    dni = Column(String(8))
    telefono = Column(String(20))
    experiencia = Column(String(20))
    pais = Column(String(100))

    usuario = relationship("Usuario", back_populates="inversores")
    inversiones = relationship("Inversion", back_populates="inversor", cascade="all, delete-orphan")

class ProyectoInversion(Base):
    __tablename__ = "proyectos_inversion"

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(255))
    descripcion = Column(Text)
    monto_requerido = Column(Numeric(12, 2))
    monto_recaudado = Column(Numeric(5, 2))  # porcentaje esperado
    fecha_inicio = Column(DateTime(timezone=True), server_default=func.now()) 
    fecha_fin = Column(Date)
    estado = Column(String(20), nullable=False, server_default="abierto")

    __table_args__ = (
        CheckConstraint(
            estado.in_(['abierto', 'cerrado', 'cancelado']),
            name="ck_estado_proyecto_valid"
        ),
    )
    
    documentos = relationship("DocumentoProyecto", back_populates="proyecto", cascade="all, delete-orphan")
    empresa = relationship("Empresa", back_populates="proyectos")
    inversiones = relationship("Inversion", back_populates="proyecto", cascade="all, delete-orphan")

class Inversion(Base):
    __tablename__ = "inversiones"

    id = Column(Integer, primary_key=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos_inversion.id", ondelete="CASCADE"), nullable=False)
    inversor_id = Column(Integer, ForeignKey("inversores.id", ondelete="CASCADE"), nullable=False)
    monto_invertido = Column(Numeric(12, 2), nullable=False)
    fecha_inversion = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String(20), nullable=False, server_default="pendiente")
    contrato_pdf = Column(Text)  # URL o nombre del archivo

    __table_args__ = (
        CheckConstraint(
            estado.in_(['pendiente', 'firmado', 'rechazado']),
            name="ck_estado_inversion_valid"
        ),
    )

    proyecto = relationship("ProyectoInversion", back_populates="inversiones")
    inversor = relationship("Inversor", back_populates="inversiones")
    pagos = relationship("PagoStripe", back_populates="inversion", cascade="all, delete-orphan")


class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True)
    remitente_id = Column(Integer, ForeignKey("usuarios.id"))
    destinatario_id = Column(Integer, ForeignKey("usuarios.id"))
    mensaje = Column(Text, nullable=False)
    enviado_en = Column(DateTime(timezone=True), server_default=func.now())

    remitente = relationship("Usuario", foreign_keys=[remitente_id], back_populates="mensajes_remitentes")
    destinatario = relationship("Usuario", foreign_keys=[destinatario_id], back_populates="mensajes_destinatarios")

class CuentaStripe(Base):
    __tablename__ = "cuentas_stripe"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True)
    stripe_account_id = Column(String(255), nullable=True)  # ej. acct_1xxxxxxx, Nullable solo por mientras
    tipo = Column(String(20), nullable=False)  # 'standard' | 'express' | 'custom'
    activa = Column(Boolean, default=True)

    usuario = relationship("Usuario")

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True)
    inversor_id = Column(Integer, ForeignKey("inversores.id", ondelete="CASCADE"), unique=True)
    saldo = Column(Numeric(12, 2), default=0.00)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    inversor = relationship("Inversor")

class RecargaWallet(Base):
    __tablename__ = "recargas_wallet"

    id = Column(Integer, primary_key=True)
    inversor_id = Column(Integer, ForeignKey("inversores.id", ondelete="CASCADE"), nullable=False)
    stripe_payment_intent = Column(String(255), nullable=True)  # ID del PaymentIntent de Stripe, por mientras opcional
    monto = Column(Numeric(12, 2), nullable=False)
    estado = Column(String(20), default="pendiente")  # exitoso | fallido | pendiente
    fecha_recarga = Column(DateTime(timezone=True), server_default=func.now())

    inversor = relationship("Inversor")


class PagoStripe(Base):
    __tablename__ = "pagos_stripe"

    id = Column(Integer, primary_key=True)
    inversion_id = Column(Integer, ForeignKey("inversiones.id", ondelete="CASCADE"), nullable=False)
    stripe_payment_id = Column(String(255))
    monto = Column(Numeric(12, 2))
    estado = Column(String(20))
    fecha_pago = Column(DateTime(timezone=True), server_default=func.now())
    # Dentro de PagoStripe:
    via_wallet = Column(Boolean, default=False)  # True si fue descontado del saldo wallet

    __table_args__ = (
        CheckConstraint(
            estado.in_(['exitoso', 'fallido', 'pendiente']),
            name="ck_estado_pago_valid"
        ),
    )

    inversion = relationship("Inversion", back_populates="pagos")
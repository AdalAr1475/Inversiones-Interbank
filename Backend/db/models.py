from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Date, DateTime,
    ForeignKey, CheckConstraint, func
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
 
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    password_hash = Column(Text, nullable=False)
    tipo_usuario = Column(String(20), nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            tipo_usuario.in_(['empresa', 'inversor','admin']),
            name="ck_tipo_usuario_valid"
        ),
    )

    empresa = relationship("Empresa", back_populates="usuario", cascade="all, delete-orphan", uselist=False)
    inversor = relationship("Inversor", back_populates="usuario", cascade="all, delete-orphan", uselist=False)
    mensajes_remitente = relationship("Mensaje", back_populates="remitente", foreign_keys="Mensaje.remitente_id")
    mensajes_destinatario = relationship("Mensaje", back_populates="destinatario", foreign_keys="Mensaje.destinatario_id")
    firmas = relationship("FirmaElectronica", back_populates="usuario")


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    ruc = Column(String(20), unique=True, nullable=False)
    descripcion = Column(Text)
    sector = Column(String(100))
    pais = Column(String(100))

    usuario = relationship("Usuario", back_populates="empresa")
    proyectos = relationship("ProyectoInversion", back_populates="empresa", cascade="all, delete-orphan")


class Inversor(Base):
    __tablename__ = "inversores"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    dni = Column(String(8))
    pais = Column(String(100))

    usuario = relationship("Usuario", back_populates="inversor")
    inversiones = relationship("Inversion", back_populates="inversor", cascade="all, delete-orphan")
    firmas = relationship("FirmaElectronica", back_populates="inversor")


class ProyectoInversion(Base):
    __tablename__ = "proyectos_inversion"

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(255))
    descripcion = Column(Text)
    monto_requerido = Column(Numeric(12, 2))
    retorno_estimado = Column(Numeric(5, 2))  # porcentaje esperado
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    estado = Column(String(20), nullable=False, server_default="abierto")

    __table_args__ = (
        CheckConstraint(
            estado.in_(['abierto', 'cerrado', 'cancelado']),
            name="ck_estado_proyecto_valid"
        ),
    )

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

    remitente = relationship("Usuario", foreign_keys=[remitente_id], back_populates="mensajes_remitente")
    destinatario = relationship("Usuario", foreign_keys=[destinatario_id], back_populates="mensajes_destinatario")


class FirmaElectronica(Base):
    __tablename__ = "firmas_electronicas"

    id = Column(Integer, primary_key=True)
    inversor_id = Column(Integer, ForeignKey("inversores.id", ondelete="CASCADE"), nullable=False)  # CORRECTO
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    firmado_en = Column(DateTime(timezone=True), server_default=func.now())
    hash_firma = Column(Text)

    usuario = relationship("Usuario", back_populates="firmas")
    inversor = relationship("Inversor", back_populates="firmas")


class PagoStripe(Base):
    __tablename__ = "pagos_stripe"

    id = Column(Integer, primary_key=True)
    inversion_id = Column(Integer, ForeignKey("inversiones.id", ondelete="CASCADE"), nullable=False)
    stripe_payment_id = Column(String(255))
    monto = Column(Numeric(12, 2))
    estado = Column(String(20))
    fecha_pago = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            estado.in_(['exitoso', 'fallido', 'pendiente']),
            name="ck_estado_pago_valid"
        ),
    )

    inversion = relationship("Inversion", back_populates="pagos")
from datetime import datetime
from sqlalchemy import (
    TIMESTAMP, Column, Integer, String, Text, Numeric, DateTime, func,
    ForeignKey, CHAR, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "Usuarios"
 
    # Columnas
    id = Column(Integer, primary_key=True)
    nombre = Column(String(255), nullable = False)
    apellido_parterno = Column(String(255), nullable = False)
    apellido_materno = Column(String(255), nullable = False)
    dni = Column(CHAR(8), unique=True, nullable=False)
    telefono = Column(CHAR(9), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    tipo_usuario = Column(Enum('emprendedor','inversor', name='tipo_usuario_enum'), nullable=False)
    creado_en = Column(TIMESTAMP, serve_default=func.current_timestamp()) 

    # Relaciones
    wallets = relationship("Wallet", back_populates="inversor")
    recargas = relationship("RecargasWallet", back_populates="inversor")
    proyectos = relationship("Proyecto", back_populates="emprendedor")
    inversiones = relationship("Inversion", back_populates="inversor")
    mensajes_remitentes = relationship("Mensaje", back_populates="remitente")
    mensajes_destinatarios = relationship("Mensaje", back_populates="destinatario")

class Wallet(Base):
    __tablename__ = "Wallets"

    # Columnas
    id = Column(Integer, primary_key=True)
    inversor_id = Column(Integer, ForeignKey("Usuarios.id", ondelete="CASCADE"))
    saldo = Column(Numeric(12, 2), default=0.00)
    actualizado_en = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relaciones
    inversor = relationship("Usuario", back_populates="wallets")

class RecargaWallet(Base):
    __tablename__ = "Recargas_wallet"

    # Columnas
    id = Column(Integer, primary_key=True)
    inversor_id = Column(Integer, ForeignKey("Usuarios.id", ondelete="CASCADE"))
    stripe_payment_intent = Column(String(255))  # ID del PaymentIntent de Stripe, por mientras opcional
    monto = Column(Numeric(12, 2), nullable=False)
    estado = Column(Enum('exitoso', 'fallido', 'pendiente', name='estado_enum'), default="pendiente")  # exitoso | fallido | pendiente
    fecha_recarga = Column(TIMESTAMP, server_default=func.current_timestamp())

    # Relaciones
    inversor = relationship("Usuario", back_populates="recargas")

class Proyecto(Base):
    __tablename__ = "Proyectos"

    # Columnas
    id = Column(Integer, primary_key=True)
    emprendedor_id = Column(Integer, ForeignKey("Usuarios.id", ondelete="CASCADE"))
    nombre_proyecto = Column(String(255), nullable=False)
    descripcion = Column(String(255), nullable=False)
    descripcion_extendida = Column(Text, nullable=False)
    sector = Column(Enum('Energía', 'Agricultura y Agroindustria', 'Tecnología y Innovación', 
                            'Salud', 'Turismo', 'Finanzas', 'Construcción e Infraestructura', 
                            'Sostenibilidad y Medio Ambiente', 'Educación', name='sector_enum'), nullable=False)
    ubicacion = Column(String(255), nullable=False)
    monto_pedido = Column(Numeric(12, 2))
    monto_recaudado = Column(Numeric(5, 2))
    retorno_estimado = Column(Numeric(8,2), nullable=False)
    fecha_inicio = Column(TIMESTAMP, server_default=func.current_timestamp()) 
    fecha_fin = Column(TIMESTAMP, nullable=False)
    estado = Column(Enum('activo', 'completado', 'cancelado', name='estado_proyecto_enum'), default='activo')

    # Relaciones
    emprendedor = relationship("Usuario", back_populates="proyectos")
    inversiones = relationship("Inversion", back_populates="proyecto")

class Inversion(Base):
    __tablename__ = "Inversiones"

    # Columnas
    id = Column(Integer, primary_key=True)
    proyecto_id = Column(Integer, ForeignKey("Proyectos.id", ondelete="CASCADE"))
    inversor_id = Column(Integer, ForeignKey("Usuarios.id", ondelete="CASCADE"))
    monto_invertido = Column(Numeric(12, 2), nullable=False)
    fecha_inversion = Column(TIMESTAMP, server_default=func.current_timestamp())
    estado = Column(Enum('pendiente', 'firmado', 'rechazado', name='estado_inversion_enum'), default='pendiente')

    # Relaciones
    proyecto = relationship("Proyecto", back_populates="inversiones")
    inversor = relationship("Usuario", back_populates="inversiones")
    documentos = relationship("DocumentoProyecto", back_populates="inversion")
    pagos = relationship("Pago", back_populates="inversion")
    
# fecha_inversion = Column(DateTime(timezone=True), server_default=func.now())

class DocumentoProyecto(Base):
    __tablename__ = "Documentos_proyecto"

    # Columnas
    id = Column(Integer, primary_key=True)
    inversion_id = Column(Integer, ForeignKey("Inversiones.id", ondelete="CASCADE"))
    nombre_documento = Column(String(255), nullable=False)
    descripcion_documento = Column(String(255), nullable=False)
    url = Column(Text, nullable=True)
    contenido_base64 = Column(Text)
    tipo_documento = Column(String(50), nullable=False)
    visibilidad = Column(Enum('público', 'privado', name='visibilidad_enum'), nullable=False, default="privado") # público | privado
    creado_en = Column(DateTime, default=datetime.now()) # Mejor usar datetime.now() aquí

    # Relaciones
    firmas = relationship("FirmaElectronica", back_populates="documento")
    inversion = relationship("Inversion", back_populates="documentos")

class FirmaElectronica(Base):
    __tablename__ = "firmas_electronicas"

    id = Column(Integer, primary_key=True)
    documento_id = Column(Integer, ForeignKey("Documentos_proyecto.id", ondelete='CASCADE'))
    firmado_en = Column(TIMESTAMP, server_default=func.current_timestamp())
    document_hash = Column(Text, nullable=False)  # Hash del documento firmado
    tx_hash = Column(Text, nullable=True)  # Hash de la transacción en blockchain
    tipo_documento = Column(String(50), nullable=False)  # 'inversion' | 'proyecto'

    documento = relationship("DocumentoProyecto", back_populates="firmas")

class Pago(Base):
    __tablename__ = "Pagos"

    id = Column(Integer, primary_key=True)
    inversion_id = Column(Integer, ForeignKey("Inversiones.id", ondelete="CASCADE"))
    stripe_payment_id = Column(String(255), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    estado = Column(Enum('exitoso', 'fallido', 'pendiente', name='estado_pago_enum'))
    fecha_pago = Column(TIMESTAMP, server_default=func.current_timestamp())

    inversion = relationship("Inversion", back_populates="pagos")

class Mensaje(Base):
    __tablename__ = "Mensajes"

    # Columnas
    id = Column(Integer, primary_key=True)
    remitente_id = Column(Integer, ForeignKey("Usuarios.id", ondelete='CASCADE'))
    destinatario_id = Column(Integer, ForeignKey("Usuarios.id", ondelete='CASCADE'))
    mensaje = Column(Text, nullable=False)
    enviado_en = Column(TIMESTAMP, server_default=func.current_timestamp())

    # Relaciones
    remitente = relationship("Usuario", back_populates="mensajes_remitentes")
    destinatario = relationship("Usuario", back_populates="mensajes_destinatarios")
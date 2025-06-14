DROP TABLE IF EXISTS Usuarios CASCADE;
CREATE TABLE Usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('empresa', 'inversor')) NOT NULL,
  wallet_address TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Empresas CASCADE;
CREATE TABLE Empresas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_empresa VARCHAR(255) NOT NULL,
  ruc VARCHAR(20) UNIQUE NOT NULL,
  descripcion TEXT,
  sector VARCHAR(20) NOT NULL,
  ubicacion VARCHAR(100),
  pais VARCHAR(100)
);

DROP TABLE IF EXISTS Inversores CASCADE;
CREATE TABLE Inversores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_inversor VARCHAR(255) NOT NULL,
  apellido_inversor VARCHAR(255) NOT NULL,
  dni CHAR(8),
  telefono VARCHAR(20),
  experiencia VARCHAR(20),
  pais VARCHAR(100)
);

DROP TABLE IF EXISTS Proyectos_inversion CASCADE;
CREATE TABLE Proyectos_inversion (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  descripcion VARCHAR(100),
  descripcion_extendida TEXT,
  monto_requerido NUMERIC(12, 2),
  monto_recaudado NUMERIC(12, 2) DEFAULT 0,
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) CHECK (estado IN ('activo', 'completado', 'cancelado')) DEFAULT 'activo'
);

DROP TABLE IF EXISTS Documentos_proyecto CASCADE;
CREATE TABLE Documentos_proyecto (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER REFERENCES Proyectos_inversion(id) ON DELETE CASCADE,
  nombre VARCHAR(255),
  descripcion TEXT,
  url TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visibilidad VARCHAR(10) CHECK (visibilidad IN ('público', 'privado')) DEFAULT 'privado'
);

DROP TABLE IF EXISTS Inversiones CASCADE;
CREATE TABLE Inversiones (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER REFERENCES proyectos_inversion(id) ON DELETE CASCADE,
  inversor_id INTEGER REFERENCES inversores(id) ON DELETE CASCADE,
  monto_invertido NUMERIC(12, 2) NOT NULL,
  fecha_inversion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'firmado', 'rechazado')) DEFAULT 'pendiente',
  contrato_pdf TEXT -- URL o nombre del archivo en S3 u otro almacenamiento
);

DROP TABLE IF EXISTS Mensajes CASCADE;
CREATE TABLE Mensajes (
  id SERIAL PRIMARY KEY,
  remitente_id INTEGER REFERENCES usuarios(id),
  destinatario_id INTEGER REFERENCES usuarios(id),
  mensaje TEXT NOT NULL,
  enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Firmas_electronicas CASCADE;
CREATE TABLE Firmas_electronicas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES Usuarios(id),
  documento_id INTEGER REFERENCES Documentos_proyecto(id) ON DELETE CASCADE,
  firmado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_hash TEXT,
  tx_hash TEXT,
  tipo_documento VARCHAR(50) -- contrato, acuerdo, etc.
);

DROP TABLE IF EXISTS Pagos_stripe CASCADE;
CREATE TABLE Pagos_stripe (
  id SERIAL PRIMARY KEY,
  inversion_id INTEGER REFERENCES inversiones(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255),
  monto NUMERIC(12, 2),
  estado VARCHAR(20) CHECK (estado IN ('exitoso', 'fallido', 'pendiente')),
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS wallets;
CREATE TABLE IF NOT EXISTS wallets
(
    id integer NOT NULL DEFAULT nextval('wallets_id_seq'::regclass),
    inversor_id integer,
    saldo numeric(12,2),
    actualizado_en timestamp with time zone DEFAULT now(),
    CONSTRAINT wallets_pkey PRIMARY KEY (id),
    CONSTRAINT wallets_inversor_id_key UNIQUE (inversor_id)
)

DROP TABLE IF EXISTS recargas_wallet;
CREATE TABLE IF NOT EXISTS recargas_wallet
(
    id integer NOT NULL DEFAULT nextval('recargas_wallet_id_seq'::regclass),
    inversor_id integer NOT NULL,
    stripe_payment_intent character varying(255) COLLATE pg_catalog."default",
    monto numeric(12,2) NOT NULL,
    estado character varying(20) COLLATE pg_catalog."default",
    fecha_recarga timestamp with time zone DEFAULT now(),
    CONSTRAINT recargas_wallet_pkey PRIMARY KEY (id)
)
DROP TABLE IF EXISTS Usuarios CASCADE;
CREATE TABLE Usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('empresa', 'inversor', 'admin')) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Empresas CASCADE;
CREATE TABLE Empresas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  ruc VARCHAR(20) UNIQUE NOT NULL,
  descripcion TEXT,
  sector VARCHAR(100),
  pais VARCHAR(100)
);

DROP TABLE IF EXISTS Inversores CASCADE;
CREATE TABLE Inversores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  dni CHAR(8),
  pais VARCHAR(100)
);

DROP TABLE IF EXISTS Proyectos_inversion CASCADE;
CREATE TABLE Proyectos_inversion (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  descripcion TEXT,
  monto_requerido NUMERIC(12, 2),
  retorno_estimado NUMERIC(5, 2), -- % esperado
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR(20) CHECK (estado IN ('abierto', 'cerrado', 'cancelado')) DEFAULT 'abierto'
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
  inversion_id INTEGER REFERENCES inversiones(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id),
  firmado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hash_firma TEXT
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

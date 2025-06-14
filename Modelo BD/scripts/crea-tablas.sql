-- Eliminar tablas existentes en el orden inverso de sus dependencias para evitar conflictos
-- El uso de CASCADE asegura que las secuencias implícitas creadas por SERIAL también se eliminen.
DROP TABLE IF EXISTS Pagos_stripe CASCADE;
DROP TABLE IF EXISTS Firmas_electronicas CASCADE;
DROP TABLE IF EXISTS Mensajes CASCADE;
DROP TABLE IF EXISTS Inversiones CASCADE;
DROP TABLE IF EXISTS Documentos_proyecto CASCADE;
DROP TABLE IF EXISTS Proyectos_inversion CASCADE;
DROP TABLE IF EXISTS Empresas CASCADE;
DROP TABLE IF EXISTS Inversores CASCADE;
DROP TABLE IF EXISTS Usuarios CASCADE;
DROP TABLE IF EXISTS recargas_wallet CASCADE; -- Aseguramos que la secuencia asociada también se elimine
DROP TABLE IF EXISTS wallets CASCADE;       -- Aseguramos que la secuencia asociada también se elimine


-- Creación de la tabla Usuarios
CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY, -- SERIAL crea la secuencia automáticamente (ej: usuarios_id_seq)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('empresa', 'inversor')) NOT NULL,
    wallet_address TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla Empresas
CREATE TABLE Empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    nombre_empresa VARCHAR(255) NOT NULL,
    ruc VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT,
    sector VARCHAR(20) NOT NULL,
    ubicacion VARCHAR(100),
    pais VARCHAR(100)
);

-- Creación de la tabla Inversores
CREATE TABLE Inversores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    nombre_inversor VARCHAR(255) NOT NULL,
    apellido_inversor VARCHAR(255) NOT NULL,
    dni CHAR(8),
    telefono VARCHAR(20),
    experiencia VARCHAR(20),
    pais VARCHAR(100)
);

-- Creación de la tabla Proyectos_inversion
CREATE TABLE Proyectos_inversion (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES Empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(255),
    descripcion VARCHAR(100),
    descripcion_extendida TEXT,
    monto_requerido NUMERIC(12, 2),
    monto_recaudado NUMERIC(12, 2) DEFAULT 0,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('activo', 'completado', 'cancelado')) DEFAULT 'activo'
);

-- Creación de la tabla Documentos_proyecto
CREATE TABLE Documentos_proyecto (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES Proyectos_inversion(id) ON DELETE CASCADE,
    nombre VARCHAR(255),
    descripcion TEXT,
    url TEXT,
    contenido_base64 TEXT,
    tipo_documento VARCHAR(50) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visibilidad VARCHAR(10) CHECK (visibilidad IN ('público', 'privado')) DEFAULT 'privado'
);

-- Creación de la tabla Inversiones
CREATE TABLE Inversiones (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES Proyectos_inversion(id) ON DELETE CASCADE,
    inversor_id INTEGER REFERENCES Inversores(id) ON DELETE CASCADE,
    monto_invertido NUMERIC(12, 2) NOT NULL,
    fecha_inversion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'firmado', 'rechazado')) DEFAULT 'pendiente',
    contrato_pdf TEXT -- URL o nombre del archivo en S3 u otro almacenamiento
);

-- Creación de la tabla Mensajes
CREATE TABLE Mensajes (
    id SERIAL PRIMARY KEY,
    remitente_id INTEGER REFERENCES Usuarios(id),
    destinatario_id INTEGER REFERENCES Usuarios(id),
    mensaje TEXT NOT NULL,
    enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla Firmas_electronicas
CREATE TABLE Firmas_electronicas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuarios(id),
    documento_id INTEGER REFERENCES Documentos_proyecto(id) ON DELETE CASCADE,
    firmado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    document_hash TEXT,
    tx_hash TEXT,
    tipo_documento VARCHAR(50) -- contrato, acuerdo, etc.
);

-- Creación de la tabla Pagos_stripe
CREATE TABLE Pagos_stripe (
    id SERIAL PRIMARY KEY,
    inversion_id INTEGER REFERENCES Inversiones(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255),
    monto NUMERIC(12, 2),
    estado VARCHAR(20) CHECK (estado IN ('exitoso', 'fallido', 'pendiente')),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla wallets
CREATE TABLE wallets
(
    id SERIAL PRIMARY KEY, -- SERIAL crea la secuencia automáticamente (ej: wallets_id_seq)
    inversor_id INTEGER UNIQUE REFERENCES Inversores(id) ON DELETE CASCADE,
    saldo NUMERIC(12,2) DEFAULT 0.00,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla recargas_wallet
CREATE TABLE recargas_wallet
(
    id SERIAL PRIMARY KEY, -- SERIAL crea la secuencia automáticamente (ej: recargas_wallet_id_seq)
    inversor_id INTEGER NOT NULL REFERENCES Inversores(id) ON DELETE CASCADE,
    stripe_payment_intent VARCHAR(255),
    monto NUMERIC(12,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('exitoso', 'fallido', 'pendiente')) DEFAULT 'pendiente',
    fecha_recarga TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

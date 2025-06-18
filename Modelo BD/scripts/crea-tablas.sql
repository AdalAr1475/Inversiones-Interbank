DROP TABLE IF EXISTS Pagos CASCADE;
DROP TABLE IF EXISTS Firmas_electronicas CASCADE;
DROP TABLE IF EXISTS Mensajes CASCADE;
DROP TABLE IF EXISTS Inversiones CASCADE;
DROP TABLE IF EXISTS Documentos_proyecto CASCADE;
DROP TABLE IF EXISTS Proyectos CASCADE;
DROP TABLE IF EXISTS Usuarios CASCADE;
DROP TABLE IF EXISTS Recargas_wallet CASCADE; -- Aseguramos que la secuencia asociada también se elimine
DROP TABLE IF EXISTS Wallets CASCADE;       -- Aseguramos que la secuencia asociada también se elimine

-- Creación de la tabla Usuarios
CREATE TABLE Usuarios (
    "id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(255) NOT NULL,
    "apellido_paterno" VARCHAR(255) NOT NULL,
    "apellido_materno" VARCHAR(255) NOT NULL,
    "dni" CHAR(8) UNIQUE NOT NULL,
    "telefono" CHAR(9) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "tipo_usuario" VARCHAR(255) CHECK (tipo_usuario IN ('emprendedor', 'inversor')) NOT NULL,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "stripe_account_id" VARCHAR(255) UNIQUE, -- ID de la cuenta de Stripe
    "estado" VARCHAR(20) CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'inactivo'
);

-- Creación de la tabla wallets
CREATE TABLE Wallets (
    "id" SERIAL PRIMARY KEY,
    "inversor_id" INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    "saldo" NUMERIC(12, 2) DEFAULT 0.00,
    "actualizado_en" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla recargas_wallet
CREATE TABLE Recargas_wallet (
    "id" SERIAL PRIMARY KEY,
    "inversor_id" INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    "stripe_payment_intent" VARCHAR(255),
    "monto" NUMERIC(12, 2) NOT NULL,
    "estado" VARCHAR(20) CHECK (estado IN ('exitoso', 'fallido', 'pendiente')) DEFAULT 'pendiente',
    "fecha_recarga" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla Proyectos
CREATE TABLE Proyectos (
    "id" SERIAL PRIMARY KEY,
    "emprendedor_id" INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    "nombre_proyecto" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "descripcion_extendida" TEXT NOT NULL,
    "sector" VARCHAR(255) NOT NULL CHECK (sector IN ('Energía', 'Agricultura y Agroindustria', 'Tecnología y Innovación', 'Salud', 'Turismo', 'Finanzas', 'Construcción e Infraestructura', 'Sostenibilidad y Medio Ambiente', 'Educación')),
    "ubicacion" VARCHAR(255) NOT NULL,
    "monto_pedido" NUMERIC(12, 2) NOT NULL,
    "monto_recaudado" NUMERIC(12, 2) NOT NULL,
    "retorno_estimado" NUMERIC(8, 2) NOT NULL,
    "fecha_inicio" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP NOT NULL,
    "estado" VARCHAR(255) NOT NULL CHECK (estado IN ('activo', 'completado', 'cancelado')) DEFAULT 'activo'
);

-- Creacion de la tabla inversiones
CREATE TABLE Inversiones (
    "id" SERIAL PRIMARY KEY,
    "proyecto_id" INTEGER REFERENCES Proyectos(id) ON DELETE CASCADE,
    "inversor_id" INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    "monto_invertido" NUMERIC(12, 2) NOT NULL,
    "fecha_inversion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(20) CHECK (estado IN ('pendiente', 'firmado', 'rechazado')) DEFAULT 'pendiente'
);

-- Creación de la tabla Documentos_proyecto
CREATE TABLE Documentos_proyecto (
    "id" SERIAL PRIMARY KEY,
    "inversion_id" INTEGER REFERENCES Inversiones(id) ON DELETE CASCADE,
    "nombre_documento" VARCHAR(255) NOT NULL,
    "descripcion_documento" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "contenido_base64" TEXT,
    "tipo_documento" VARCHAR(50) NOT NULL,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "visibilidad" VARCHAR(10) CHECK (visibilidad IN ('público', 'privado')) DEFAULT 'privado'
);

-- Creación de la tabla Firmas_electronicas
CREATE TABLE Firmas_electronicas (
    "id" SERIAL PRIMARY KEY,
    "documento_id" INTEGER REFERENCES Documentos_proyecto(id) ON DELETE CASCADE,
    "firmado_en" TIMESTAMP NOT NULL,
    "documento_hash" TEXT,
    "tx_hash" TEXT,
    "tipo_documento" VARCHAR(50) NOT NULL
);

-- Creación de la tabla Pagos_stripe
CREATE TABLE Pagos (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "inversion_id" INTEGER REFERENCES Inversiones(id) ON DELETE CASCADE,
    "stripe_payment_id" VARCHAR(255) NOT NULL,
    "monto" NUMERIC(10, 2) NOT NULL,
    "estado" VARCHAR(20) CHECK (estado IN ('exitoso', 'fallido', 'pendiente')),
    "fecha_pago" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla Mensajes
CREATE TABLE Mensajes (
    "id" SERIAL PRIMARY KEY,
    "remitente_id" INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    "destinatario_id" INTEGER REFERENCES Usuarios(id) ON DELETE CASCADE,
    "mensaje" TEXT NOT NULL,
    "enviado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

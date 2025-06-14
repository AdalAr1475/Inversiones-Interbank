--- Eliminación de datos anteriores ---
DO $$ 
DECLARE
    row RECORD;
    seq RECORD;
BEGIN
    -- Truncar todas las tablas en el esquema 'public'
    FOR row IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(row.tablename) || ' CASCADE';
    END LOOP;

    -- Reiniciar las secuencias asociadas
    FOR seq IN
        SELECT c.oid::regclass::text AS sequence_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'S' -- 'S' indica que es una secuencia
          AND n.nspname = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq.sequence_name) || ' RESTART WITH 1';
    END LOOP;
END $$;

/*
-- 1) Usuario administrador puro
INSERT INTO Usuarios (email, nombre, password_hash, tipo_usuario)
VALUES 
  ('admin@test.com', 'Administrador General', 'hashed_pwd_admin', 'admin');

-- 2) Usuario con rol de administrador y que además es empresa
-- Primero creamos el usuario como tipo 'admin'
INSERT INTO Usuarios (email, nombre, password_hash, tipo_usuario, wallet_address)
VALUES 
  ('admin_empresa@test.com', 'Admin Empresa S.A.', 'hashed_pwd_emp', 'admin', '0xAbC1234EfG5678HiJkL');

-- Ahora añadimos la fila en Empresas apuntando a ese usuario
-- Suponiendo que el serial de Usuarios para este insert quedó en id = 2
INSERT INTO Empresas (usuario_id, ruc, descripcion, sector, pais)
VALUES 
  (2, '20123456789', 'Empresa de tecnología financiera', 'FinTech', 'Perú');

-- 3) Usuario inversor (no administrador)
INSERT INTO Usuarios (email, nombre, password_hash, tipo_usuario, wallet_address)
VALUES 
  ('inversor1@test.com', 'Juan Pérez', 'hashed_pwd_inv', 'inversor', '0xDeF9876GhI5432KlMnO');

-- Ahora añadimos la fila en Inversores apuntando a ese usuario
-- Suponiendo que el serial de Usuarios para este insert quedó en id = 3
INSERT INTO Inversores (usuario_id, dni, pais)
VALUES
  (3, '87654321', 'Perú');
*/

-- Poblamiento provisional para documentos:
-- Poblar Usuarios (tipo empresa)
INSERT INTO Usuarios (email, password_hash, tipo_usuario, wallet_address)
VALUES 
  ('matiaz.chevez.c@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor', '0xABC123'),
  ('adal.aranda.n@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor', '0xABC123'),
  ('diogo.abregu.g@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor', '0xABC123'),
  ('empresa1@emp.com', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'empresa', '0xABC123'),
  ('empresa2@emp.com', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'empresa', '0xABC123');

INSERT INTO Inversores (usuario_id, nombre_inversor, apellido_inversor, dni, telefono, experiencia, pais)
VALUES
  (1, 'Matiaz', 'Chevez', '70707070', '+51923444121', 'principiante', 'Perú'),
  (2, 'Adal', 'Aranda', '70707071', '+51923444120', 'principiante', 'Perú'),
  (3, 'Diogo', 'Abregu', '70707072', '+51923444124', 'principiante', 'Perú');

INSERT INTO Empresas (usuario_id, nombre_empresa, ruc, descripcion, sector, ubicacion)
VALUES 
  (4, 'TechSolutions SAC', '20123456789', 'Empresa de tecnología e innovación', 'TecnologIa', 'Lima, Peru'),
  (5, 'Invest S.A.', '20987654321', 'Empresa que ofrece servicios de Fintech', 'Energia', 'Arequipa, Peru');

-- Poblamiento de tabla proyectos_inversion
INSERT INTO proyectos_inversion (empresa_id, titulo, descripcion, descripcion_extendida, monto_requerido, monto_recaudado, fecha_fin) 
VALUES
  (1, 'Plataforma de E-learning', 'Plataforma digital interactiva para enseñanza a distancia.', 'Creación de una plataforma digital interactiva para la enseñanza a distancia, facilitando el acceso a contenidos educativos, con herramientas de seguimiento de progreso y recursos de aprendizaje en línea accesibles desde cualquier dispositivo.', 50000.00, 28000.00, '2025-12-31'),
  (1, 'App de Salud Preventiva', 'Aplicación para monitoreo de salud y hábitos saludables.', 'Desarrollo de una aplicación móvil que permite a los usuarios monitorear su salud mediante recordatorios, estadísticas personalizadas y consejos prácticos, enfocándose en la prevención de enfermedades y la promoción de un estilo de vida saludable.', 70000.00, 13000.00, '2025-11-30'),
  (2, 'Parque Solar en Moquegua', 'Instalación de un parque solar para energía limpia en Moquegua.', 'El proyecto consiste en la instalación de un parque solar de gran escala en Moquegua, con el objetivo de generar energía limpia y sostenible para abastecer a más de 500 hogares, contribuyendo a la transición hacia energías renovables en la región.', 60000.00, 19000.00, '2026-06-30'),
  (2, 'Planta de Energía Solar en Moquegua', 'Planta solar para abastecer de electricidad a comunidades locales.', 'Desarrollo de una planta de energía solar que generará electricidad para abastecer a comunidades rurales y urbanas en Moquegua. El proyecto fomentará el uso de energías renovables, mejorando la accesibilidad energética y reduciendo la dependencia de fuentes no renovables.', 80000.00, 30000.00, '2026-05-15');

-- Poblamiento de tabla inversiones
INSERT INTO inversiones (proyecto_id, inversor_id, monto_invertido, estado, contrato_pdf) VALUES
(1, 1, 10000.00, 'firmado', 'contrato1.pdf'),
(1, 2, 18000.00, 'firmado', 'contrato2.pdf'),
(2, 1, 13000.00, 'firmado', 'contrato3.pdf'),
(3, 2, 19000.00, 'firmado', 'contrato4.pdf'),
(4, 1, 30000.00, 'firmado', 'contrato5.pdf');

-- Poblar Documentos_proyecto (5 documentos en total)
INSERT INTO Documentos_proyecto (proyecto_id, nombre, descripcion, url, contenido_base64, tipo_documento, visibilidad)
VALUES
    -- Documento 1: Plan de Negocio
    (1, 'Plan de Negocio - E-learning', 
     'Documento detallado del modelo de negocio', 
     'https://example.com/docs/plan_nego_elearning.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFnZX', -- CONTENIDO_BASE64_DEL_PDF real aquí
     'Plan de Negocio', 
     'público'),

    -- Documento 2: Proyección Financiera
    (1, 'Proyección Financiera 2025', 
     'Proyecciones de ingresos y egresos del proyecto', 
     'https://example.com/docs/finanzas_elearning.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
     'Financiero', 
     'privado'),

    -- Documento 3: Wireframes de la App
    (2, 'Wireframes de la App', 
     'Diseños iniciales de la interfaz de usuario', 
     'https://example.com/docs/wireframes_app.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
     'Diseño', 
     'público'),

    -- Documento 4: Estudio de Impacto Ambiental
    (3, 'Estudio de Impacto Ambiental', 
     'Informe ambiental requerido para licencias', 
     'https://example.com/docs/impacto_solar.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
     'Informe Ambiental', 
     'público'),

    -- Documento 5: Contrato de Energía Renovable
    (3, 'Contrato de Energía Renovable', 
     'Borrador del contrato de venta de energía', 
     'https://example.com/docs/contrato_solar.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
     'Contrato', 
     'privado');

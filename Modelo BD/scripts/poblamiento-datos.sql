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
  ('empresa1@example.com', 'hashedpass1', 'empresa', '0xABC123'),
  ('empresa2@example.com', 'hashedpass2', 'empresa', '0xDEF456');

-- Poblar Empresas
INSERT INTO Empresas (usuario_id, nombre_empresa, ruc, descripcion, sector, ubicacion, pais)
VALUES 
  (1, 'TechSolutions SAC', '20123456789', 'Empresa de tecnología e innovación', 'Tecnología', 'Lima', 'Perú'),
  (2, 'GreenInvest S.A.', '20987654321', 'Empresa de proyectos sostenibles', 'Energía', 'Arequipa', 'Perú');

-- Poblar Proyectos_inversion
INSERT INTO Proyectos_inversion (empresa_id, titulo, descripcion, monto_requerido, retorno_estimado, fecha_inicio, fecha_fin)
VALUES 
  (1, 'Plataforma de E-learning', 'Desarrollo de una plataforma educativa digital.', 50000.00, 12.50, '2025-06-01', '2025-12-31'),
  (1, 'App de salud preventiva', 'Aplicación para monitoreo de salud preventiva.', 80000.00, 15.00, '2025-07-01', '2026-01-15'),
  (2, 'Parque solar en Moquegua', 'Instalación de un parque de energía solar.', 150000.00, 18.00, '2025-06-15', '2026-06-15');

-- Poblar Documentos_proyecto (5 documentos en total)
INSERT INTO Documentos_proyecto (proyecto_id, nombre, descripcion, url, visibilidad)
VALUES
  (1, 'Plan de Negocio - E-learning', 'Documento detallado del modelo de negocio', 'https://example.com/docs/plan_nego_elearning.pdf', 'público'),
  (1, 'Proyección Financiera 2025', 'Proyecciones de ingresos y egresos del proyecto', 'https://example.com/docs/finanzas_elearning.pdf', 'privado'),
  (2, 'Wireframes de la App', 'Diseños iniciales de la interfaz de usuario', 'https://example.com/docs/wireframes_app.pdf', 'público'),
  (3, 'Estudio de Impacto Ambiental', 'Informe ambiental requerido para licencias', 'https://example.com/docs/impacto_solar.pdf', 'público'),
  (3, 'Contrato de Energía Renovable', 'Borrador del contrato de venta de energía', 'https://example.com/docs/contrato_solar.pdf', 'privado');

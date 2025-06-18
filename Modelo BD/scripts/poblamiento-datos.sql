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


-- Poblamiento de la tabla Usuarios
INSERT INTO Usuarios (nombre, apellido_paterno, apellido_materno, dni, telefono, email, password_hash, tipo_usuario)
VALUES 
  ('Matiaz','Chevez','Collahuacho','70235612','910910910','matiaz.chevez.c@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor'),
  ('Adal','Aranda','Nuñez','70348211','923412222','adal.aranda.n@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor'),
  ('Diogo','Abregu','Gonzales','74209982','910234123','diogo.abregu.g@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor'),
  ('Diego','Bernal','Tamayo','71443322','910333444','diego.bernal.t@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor'),
  ('Nicol','Auqui','Castilla','73029934','910934583','nicol.auqui.c@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor'),
  ('Sharon','Guisado','Alejo','72340094','912343511','sharon.guisado.a@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor'),
  ('Saul','Anyaipoma','Hurtado','68991023','923111434','saul.anyaipoma.h@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'inversor'),
  ('Elvis','Arboleda','Terrones','71232210','923100100','elvis.arboleda.t@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'emprendedor'),
  ('Sebastian','Cardenas','Lujan','73707123','901344222','sebastian.cardenas.l@uni.pe', '$2b$12$zg8NKg8ksNNmW8.hJPehbOFduI2nG9A.MQseeKw27Kf2dixbSzp6m', 'emprendedor');

-- Poblamiento de la tabla Wallets
INSERT INTO Wallets (inversor_id, saldo)
VALUES 
  (1, 100000.00), -- Matiaz Chevez
  (2, 100000.00), -- Adal Aranda
  (3, 100000.00), -- Diogo Abregu
  (4, 100000.00), -- Diego Bernal
  (5, 100000.00), -- Nicol Auqui
  (6, 100000.00), -- Sharon Guisado
  (7, 100000.00); -- Saul Anyaipoma

-- Poblamiento de tabla proyectos_inversion
INSERT INTO Proyectos (emprendedor_id, nombre_proyecto, descripcion, descripcion_extendida, sector, ubicacion, monto_pedido, monto_recaudado, retorno_estimado, fecha_inicio, fecha_fin) 
VALUES
  (8, 'Energía Solar en Comunidades Rurales de Arequipa', 
    'Proyecto para la instalación de paneles solares en comunidades rurales de la región sur de Perú', 
    'Este proyecto tiene como objetivo llevar energía limpia y accesible a zonas rurales de Arequipa que no tienen acceso a la red eléctrica. La implementación de paneles solares permitirá a las comunidades rurales no solo reducir su dependencia de fuentes de energía contaminantes, sino también mejorar la calidad de vida mediante el acceso a electricidad para iluminación, comunicación y desarrollo de pequeñas industrias. A largo plazo, se prevé que el uso de energía solar contribuya a la mejora de la salud, la educación y la economía local, generando una fuente de ingresos sostenible mediante la comercialización de excedentes de energía, cuando sea posible. Este proyecto también contempla la capacitación de las comunidades en el mantenimiento y gestión de los sistemas solares, asegurando la sostenibilidad a largo plazo.',
    'Energía', 'Arequipa, Perú', 150000, 90000, 0.25, '2024-05-10', '2025-12-31'),
    
  (8, 'Agroprocesadora de Quinua en Cusco para Exportación', 
    'Planta para el procesamiento de quinua, maca y otros productos andinos para la exportación', 
    'El proyecto busca crear una planta moderna de procesamiento de productos agrícolas andinos, como quinua, maca, camu camu y otros superalimentos. La iniciativa se centrará en añadir valor a estos productos, que actualmente son exportados en su forma cruda. A través del procesamiento y empaquetado, se generarán productos alimenticios listos para el mercado internacional, tales como harina de quinua, extractos de maca y otros productos derivados. Además de promover la agricultura sostenible, la planta brindará una fuente de ingresos para los pequeños agricultores locales mediante la compra de sus cosechas a precios justos. El impacto positivo en la comunidad incluirá la creación de empleo, mejoras en la infraestructura agrícola y el fortalecimiento de la identidad cultural mediante el impulso a la agricultura tradicional andina.',
    'Agricultura y Agroindustria', 'Cusco, Perú', 200000, 120000, 0.35, '2024-05-11', '2025-11-30'),

  (8, 'Plataforma Educativa Online para Zonas Rurales de Ayacucho', 
    'Desarrollo de una plataforma educativa online dirigida a estudiantes de zonas rurales', 
    'Este proyecto tiene como objetivo proporcionar acceso a educación de calidad a estudiantes de zonas rurales de Ayacucho, donde los recursos educativos y las infraestructuras tradicionales son limitadas. A través de una plataforma digital, se ofrecerán cursos, talleres y materiales educativos en áreas como matemáticas, ciencias, idiomas y habilidades técnicas. La plataforma será accesible desde dispositivos móviles, permitiendo a los estudiantes de regiones remotas seguir su educación sin tener que desplazarse a las grandes ciudades. Además, el proyecto contempla la creación de una red de tutores locales que apoyen a los estudiantes, garantizando que tengan la orientación necesaria para completar los cursos. Este proyecto también ayudará a reducir la brecha educativa en el país, proporcionando a los estudiantes rurales las mismas oportunidades que a aquellos que viven en áreas urbanas.',
    'Educación', 'Ayacucho, Perú', 100000, 50000, 0.4, '2024-05-12', '2026-06-15'),

  (8, 'Agroturismo Sostenible en la Selva Central de Junín', 
    'Desarrollo de un complejo de agroturismo que promueve el turismo rural y sostenible', 
    'El proyecto busca ofrecer una experiencia única de turismo en la selva central de Junín, que combine actividades agrícolas con ecoturismo. Los turistas podrán participar en actividades agrícolas como la cosecha de cacao, café y otros cultivos locales, y al mismo tiempo disfrutar de la belleza natural de la selva. A través de este proyecto, se promoverá la conservación del medio ambiente, el respeto por las comunidades locales y la preservación de las tradiciones culturales de la zona. El agroturismo no solo será una forma de incentivar el turismo en áreas rurales, sino también una oportunidad para los agricultores de diversificar sus fuentes de ingreso y mejorar la calidad de vida. Se incluirán alojamientos sostenibles, transporte ecológico y actividades que involucren a los habitantes locales como guías turísticos.',
    'Turismo', 'Junín, Perú', 130000, 80000, 0.3, '2024-06-01', '2025-11-10'),

  (8, 'Planta de Reciclaje de Residuos Sólidos en Lima', 
    'Creación de una planta de reciclaje que gestione residuos sólidos urbanos en Lima', 
    'Este proyecto tiene como objetivo construir y operar una planta de reciclaje de residuos sólidos en Lima, con el fin de mejorar la gestión de residuos en la ciudad y reducir la contaminación. La planta se encargará de recolectar, clasificar y procesar materiales reciclables como plásticos, metales, papel y vidrio. Además, se desarrollará una red de recolección selectiva que permita a los ciudadanos separar los residuos reciclables en sus hogares, contribuyendo al proceso de reciclaje. El proyecto también incluirá un centro de concientización y educación ambiental, con el objetivo de sensibilizar a la población sobre la importancia del reciclaje y la reducción de residuos. A largo plazo, se espera generar empleo y, a través de la venta de materiales reciclados, contribuir a la economía circular del país.',
    'Sostenibilidad y Medio Ambiente', 'Lima, Perú', 250000, 180000, 0.5, '2024-06-02', '2026-04-05'),

  (9, 'Fintech de Inclusión Financiera en la Región de Lima', 
    'Desarrollo de una plataforma de pagos y microcréditos para personas no bancarizadas en áreas rurales', 
    'Este proyecto se enfoca en ofrecer servicios financieros básicos como pagos móviles, microcréditos, ahorro y seguros para personas que no tienen acceso a bancos tradicionales, especialmente en áreas rurales. A través de una aplicación móvil fácil de usar, los usuarios podrán realizar pagos, transferencias y gestionar sus ahorros sin la necesidad de una cuenta bancaria. Además, el proyecto permitirá el acceso a microcréditos para emprendedores rurales que necesitan capital para sus negocios. Esto no solo incrementará la inclusión financiera, sino que también estimulará la economía local al ofrecer a los habitantes rurales las herramientas necesarias para participar en la economía formal. La plataforma también incluirá una red de agentes locales que brindarán soporte y educación financiera.',
    'Finanzas', 'Lima, Perú', 120000, 75000, 0.4, '2024-06-03', '2026-02-28'),

  (9, 'Energía Eólica en la Costa Norte de Piura', 
    'Instalación de turbinas eólicas en la costa norte para generar energía limpia', 
    'Este proyecto tiene como objetivo aprovechar los fuertes vientos que se presentan en la costa norte de Piura para generar energía eólica. La instalación de turbinas eólicas no solo contribuirá a diversificar la matriz energética del país, sino que también reducirá las emisiones de gases de efecto invernadero. La energía producida será vendida a la red nacional y utilizará tecnologías de vanguardia para maximizar la eficiencia. A largo plazo, el proyecto creará empleos directos en la construcción y operación de las turbinas eólicas, además de beneficiar a las comunidades locales con el acceso a energía más barata y limpia. Este proyecto también contempla la capacitación de la fuerza laboral en energías renovables, fomentando el desarrollo de nuevas habilidades técnicas.',
    'Energía', 'Piura, Perú', 200000, 150000, 0.35, '2024-06-04', '2025-08-20'),

  (9, 'Soluciones Tecnológicas para la Agricultura en Lima', 
    'Desarrollo de herramientas tecnológicas para mejorar la productividad agrícola', 
    'Este proyecto propone la creación de plataformas tecnológicas que faciliten la gestión de cultivos, optimicen el uso de agua y recursos, y aumenten la eficiencia de los agricultores en Lima y otras regiones cercanas. La tecnología incluirá sensores para monitorear el crecimiento de los cultivos, drones para la aplicación de pesticidas y fertilizantes, y plataformas móviles que proporcionen recomendaciones en tiempo real sobre prácticas agrícolas sostenibles. Además, se brindarán servicios de capacitación a los agricultores para que puedan integrar estas tecnologías en sus prácticas diarias. El objetivo es aumentar la productividad agrícola, reducir el uso de recursos naturales y mejorar la calidad de los productos para que los agricultores puedan acceder a mejores mercados tanto locales como internacionales.',
    'Tecnología y Innovación', 'Lima, Perú', 180000, 130000, 0.45, '2024-06-05', '2025-12-10'),

  (9, 'Viviendas Sostenibles en Arequipa para Familias de Bajos Recursos', 
    'Desarrollo de un proyecto inmobiliario que utilice materiales ecológicos y eficiencia energética', 
    'El proyecto busca construir viviendas utilizando materiales sostenibles como madera certificada, materiales reciclados y técnicas de eficiencia energética para reducir el consumo de energía en las viviendas. Se desarrollarán viviendas accesibles para familias de ingresos medios y bajos en Arequipa, con un diseño que maximice la utilización de recursos naturales como la luz solar y la ventilación natural. Además de la sostenibilidad en la construcción, el proyecto se enfocará en la creación de un entorno verde que promueva la calidad de vida, con espacios comunes para la comunidad y el fomento de un estilo de vida más saludable. Este proyecto contribuirá al desarrollo de un mercado inmobiliario más responsable y a la creación de una comunidad más sostenible.',
    'Construcción e Infraestructura', 'Arequipa, Perú', 220000, 150000, 0.3, '2024-06-06', '2026-04-25'),

  (9, 'Telemedicina para Comunidades Aisladas en Loreto', 
    'Desarrollo de una plataforma digital de telemedicina para atender a poblaciones remotas', 
    'Este proyecto tiene como objetivo ofrecer consultas médicas a distancia mediante una plataforma digital de telemedicina, destinada a las comunidades más remotas del departamento de Loreto, que no tienen acceso a servicios de salud especializados. A través de esta plataforma, los pacientes podrán recibir diagnósticos, recomendaciones médicas y seguimiento de su salud sin necesidad de desplazarse a centros urbanos. La plataforma incluirá un sistema de videollamadas, mensajería segura y una base de datos de médicos especializados en diversas áreas. Además, se implementará un sistema de monitoreo remoto de pacientes para condiciones crónicas, lo que permitirá realizar un seguimiento constante sin que el paciente tenga que estar físicamente presente. El proyecto también incluirá campañas de concientización sobre el uso de la telemedicina y el acceso a servicios médicos en línea.',
    'Salud', 'Loreto, Perú', 150000, 95000, 0.4, '2024-06-07', '2026-03-15');

-- Poblamiento de tabla Inversiones
INSERT INTO Inversiones (proyecto_id, inversor_id, monto_invertido, fecha_inversion) 
VALUES
-- Proyecto 1 (Monto recaudado: 90,000)
(1, 1, 25000, '2024-01-15 10:00:00'),
(1, 3, 30000, '2024-01-16 12:00:00'),
(1, 5, 15000, '2024-01-17 14:00:00'),
(1, 7, 20000, '2024-01-18 16:00:00'),

-- Proyecto 2 (Monto recaudado: 120,000)
(2, 1, 40000, '2024-02-01 10:00:00'),
(2, 2, 30000, '2024-02-02 12:00:00'),
(2, 6, 20000, '2024-02-03 14:00:00'),
(2, 3, 20000, '2024-02-04 16:00:00'),
(2, 1, 10000, '2024-02-05 18:00:00'),

-- Proyecto 3 (Monto recaudado: 50,000)
(3, 1, 20000, '2024-03-01 10:00:00'),
(3, 6, 20000, '2024-03-02 12:00:00'),
(3, 3, 10000, '2024-03-03 14:00:00'),

-- Proyecto 4 (Monto recaudado: 80,000)
(4, 1, 40000, '2025-04-01 10:00:00'),
(4, 2, 10000, '2025-04-02 12:00:00'),
(4, 7, 10000, '2025-04-03 14:00:00'),
(4, 4, 20000, '2025-04-04 16:00:00'),

-- Proyecto 5 (Monto recaudado: 180,000)
(5, 1, 45000, '2025-05-01 10:00:00'),
(5, 4, 35000, '2025-05-02 12:00:00'),
(5, 5, 30000, '2025-05-03 14:00:00'),
(5, 4, 30000, '2025-05-04 16:00:00'),
(5, 5, 40000, '2025-05-05 18:00:00'),

-- Proyecto 6 (Monto recaudado: 75,000)
(6, 5, 35000, '2025-06-01 10:00:00'),
(6, 7, 25000, '2025-06-02 12:00:00'),
(6, 3, 15000, '2025-06-03 14:00:00'),

-- Proyecto 7 (Monto recaudado: 150,000)
(7, 2, 45000, '2025-07-01 10:00:00'),
(7, 1, 35000, '2025-07-02 12:00:00'),
(7, 3, 40000, '2025-07-03 14:00:00'),
(7, 6, 30000, '2025-07-04 16:00:00'),

-- Proyecto 8 (Monto recaudado: 130,000)
(8, 1, 45000, '2025-08-01 10:00:00'),
(8, 2, 25000, '2025-08-02 12:00:00'),
(8, 3, 20000, '2025-08-03 14:00:00'),
(8, 4, 20000, '2025-08-04 16:00:00'),
(8, 5, 20000, '2025-08-05 18:00:00'),

-- Proyecto 9 (Monto recaudado: 150,000)
(9, 7, 50000, '2025-09-01 10:00:00'),
(9, 1, 40000, '2025-09-02 12:00:00'),
(9, 2, 30000, '2025-09-03 14:00:00'),
(9, 7, 30000, '2025-09-04 16:00:00'),

-- Proyecto 10 (Monto recaudado: 95,000)
(10, 2, 35000, '2025-10-01 10:00:00'),
(10, 2, 30000, '2025-10-02 12:00:00'),
(10, 5, 15000, '2025-10-03 14:00:00'),
(10, 6, 15000, '2025-10-04 16:00:00');



-- Poblar Documentos_proyecto (5 documentos en total)
INSERT INTO Documentos_proyecto (inversion_id, nombre_documento, descripcion_documento, url, contenido_base64, tipo_documento, creado_en, visibilidad)
VALUES
    -- Documento 1: Plan de Negocio
    (1, 'Plan de Negocio - E-learning', 
     'Documento detallado del modelo de negocio', 
     'https://example.com/docs/plan_nego_elearning.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFnZX', -- CONTENIDO_BASE64_DEL_PDF real aquí
	 'Plan de Negocio', 
     TO_DATE('17-06-2025','DD-MM-YYYY'),
	 'público'),

    -- Documento 2: Proyección Financiera
    (1, 'Proyección Financiera 2025', 
     'Proyecciones de ingresos y egresos del proyecto', 
     'https://example.com/docs/finanzas_elearning.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
	 'Financiero', 
      TO_DATE('17-06-2025','DD-MM-YYYY'),
	 'privado'),

    -- Documento 3: Wireframes de la App
    (2, 'Wireframes de la App', 
     'Diseños iniciales de la interfaz de usuario', 
     'https://example.com/docs/wireframes_app.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
	 'Diseño', 
      TO_DATE('17-06-2025','DD-MM-YYYY'),
	 'público'),

    -- Documento 4: Estudio de Impacto Ambiental
    (3, 'Estudio de Impacto Ambiental', 
     'Informe ambiental requerido para licencias', 
     'https://example.com/docs/impacto_solar.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
     'Informe Ambiental', 
      TO_DATE('17-06-2025','DD-MM-YYYY'),
	 'público'),

    -- Documento 5: Contrato de Energía Renovable
    (3, 'Contrato de Energía Renovable', 
     'Borrador del contrato de venta de energía', 
     'https://example.com/docs/contrato_solar.pdf', 
     'JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlcy1FUykvU3RydWN0VHJlZzMNCjEgMCBvYmoNCjw8L1R5cGUvUGFn', -- CONTENIDO_BASE64_DEL_PDF real aquí
     'Contrato', 
      TO_DATE('17-06-2025','DD-MM-YYYY'),
	 'privado');


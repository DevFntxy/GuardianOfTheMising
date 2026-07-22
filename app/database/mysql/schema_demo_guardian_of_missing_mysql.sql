-- =====================================================================
-- GuardianOfTheMising - Esquema MySQL (version DEMO / recortada)
-- Autor: Jose Arturo Garcia Gonzalez (230629) - Diseño y Estructura de BD
-- Motor: MySQL 8.x
-- Solo lo indispensable para la simulacion: Usuarios+Roles, Alertas,
-- ContactosEmergencia, Evidencias. Geocercas y Ubicaciones viven en
-- MongoDB (ver setup_mongo.js).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS guardian_of_the_missing
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE guardian_of_the_missing;

-- ---------------------------------------------------------------------
-- 1. Roles (catálogo)
-- ---------------------------------------------------------------------
CREATE TABLE Roles (
    id_rol      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol  VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 'Administrador' es usado por el administrador gubernamental (acceso a datos sensibles)
INSERT INTO Roles (nombre_rol) VALUES ('Administrador'), ('Usuario'), ('Mantenimiento');

-- ---------------------------------------------------------------------
-- 2. Usuarios
-- ---------------------------------------------------------------------
CREATE TABLE Usuarios (
    id_usuario          INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(50) NOT NULL,
    apellido_paterno    VARCHAR(50) NOT NULL,
    apellido_materno    VARCHAR(50) NULL,
    correo              VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash     VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20) NULL,
    fecha_nacimiento    DATE NULL,
    id_rol              INT NOT NULL,
    activo              TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_usuarios_correo ON Usuarios(correo);

-- ---------------------------------------------------------------------
-- 3. ContactosEmergencia
-- ---------------------------------------------------------------------
CREATE TABLE ContactosEmergencia (
    id_contacto     INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20) NOT NULL,
    correo          VARCHAR(100) NULL,
    parentesco      VARCHAR(50) NULL,
    prioridad       INT NOT NULL DEFAULT 1,
    fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contactos_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. (Geocercas vive en MongoDB - coleccion "geocercas". Ver setup_mongo.js)
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 5. Alertas
--    id_geocerca_mongo: NULL = boton de panico manual
--                       con valor = disparada por una geocerca (Mongo)
-- ---------------------------------------------------------------------
CREATE TABLE Alertas (
    id_alerta          INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario         INT NOT NULL,
    id_geocerca_mongo  CHAR(24) NULL COMMENT 'ObjectId de la geocerca en MongoDB. Sin FK real: se valida en el backend.',
    latitud            DECIMAL(10,7) NOT NULL,
    longitud           DECIMAL(10,7) NOT NULL,
    fecha_hora         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado             ENUM('activa','atendida','cancelada','falsa_alarma') NOT NULL DEFAULT 'activa',
    comentario         VARCHAR(255) NULL,
    CONSTRAINT fk_alertas_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_alertas_usuario_fecha ON Alertas(id_usuario, fecha_hora);

-- ---------------------------------------------------------------------
-- 6. (Ubicaciones vive en MongoDB - coleccion "ubicaciones". Ver setup_mongo.js)
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 7. Evidencias (foto / audio ligados a una alerta)
-- ---------------------------------------------------------------------
CREATE TABLE Evidencias (
    id_evidencia    INT AUTO_INCREMENT PRIMARY KEY,
    id_alerta       INT NOT NULL,
    tipo_evidencia  ENUM('foto','audio') NOT NULL,
    url_archivo     VARCHAR(255) NOT NULL,
    latitud         DECIMAL(10,7) NULL,
    longitud        DECIMAL(10,7) NULL,
    fecha_hora      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evidencias_alerta
        FOREIGN KEY (id_alerta) REFERENCES Alertas(id_alerta)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- Fin del script (version demo: 4 tablas en MySQL + 2 colecciones Mongo)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS fleetops_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fleetops_db;

CREATE TABLE IF NOT EXISTS vehicles (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  plate            VARCHAR(20)  NOT NULL UNIQUE,
  brand            VARCHAR(60)  NOT NULL,
  model            VARCHAR(60)  NOT NULL,
  year             SMALLINT,
  type             VARCHAR(40),
  status           ENUM('activo','inactivo','mantenimiento') NOT NULL DEFAULT 'activo',
  fuel_capacity    DECIMAL(6,2),
  insurance_expiry DATE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspections (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id  INT NOT NULL,
  driver_name VARCHAR(120) NOT NULL,
  engine      ENUM('pass','caution','fail') NOT NULL,
  lights      ENUM('pass','caution','fail') NOT NULL,
  tires       ENUM('pass','caution','fail') NOT NULL,
  safety      ENUM('pass','caution','fail') NOT NULL,
  result      ENUM('pass','fail') NOT NULL,
  engine_rating TINYINT DEFAULT NULL,
  lights_rating TINYINT DEFAULT NULL,
  tires_rating  TINYINT DEFAULT NULL,
  safety_rating TINYINT DEFAULT NULL,
  notes         TEXT,
  photos        TEXT,
  damage_map    MEDIUMTEXT DEFAULT NULL,
  signature     MEDIUMTEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id      INT NOT NULL UNIQUE,
  trigger_type    ENUM('distance','time') NOT NULL,
  trigger_value   INT NOT NULL,
  program_id      TINYINT NOT NULL,
  current_step    TINYINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id     INT NOT NULL,
  type           ENUM('preventivo','correctivo','predictivo') NOT NULL DEFAULT 'preventivo',
  description    TEXT NOT NULL,
  cost           DECIMAL(10,2) DEFAULT 0.00,
  status         ENUM('pendiente','en_progreso','completado') NOT NULL DEFAULT 'pendiente',
  scheduled_date DATE,
  completed_date DATE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE DATABASE railway;
use railway;

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `id_rol` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_users_rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `users` (`id`, `user`, `name`, `pass`, `id_rol`) VALUES
(55, 'ixchell', 'ixchel salgado Nazario', '$2a$08$WLcCpkiSMLQv.3eGRldSKe1B7g1b3SkSNwSqpygQ4sTv358FGjtra', 2),
(65, 'emma', 'Emma Flores', '$2a$08$epMcBZ3T8vSREV9zsO1Pd.K4HwGG3Sd2TqFz35laUno6HSsKK8To2', 1),
(66, 'Diana', 'Diana Arlett Flores Carmona', '$2a$08$OYuSDlWELi1pqK0PnZxZEug66NE086sYSgxPCa60X1tARbG7mzyCC', 1),
(67, 'israel', 'Israel Nogueda Pineda', '$2a$08$IABeXlEslfevSY5k/c0Up.m9uWc9R9VglL1Kw0eFtqU88gX09CgN2', 1),
(68, 'Elias', 'Elias Flores Olea', '$2a$08$Esmq8B/m2uTQTSSlhQ8v9eCBjh4RNxNxxTDAwU40otlaVowAuOEja', 1);

DROP TABLE IF EXISTS `rol`;
CREATE TABLE IF NOT EXISTS `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `rol_name` varchar(30) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `rol` (`id_rol`, `rol_name`) VALUES
(1, 'admin'),
(2, 'usuario');





DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `a_materno` varchar(50) NOT NULL,
  `a_paterno` varchar(50) NOT NULL,
  `cel` varchar(20) DEFAULT NULL,
  `adress` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `customers`( `name`, `a_materno`, `a_paterno`, `cel`, `adress`) VALUES ('Nadie','quiere','sereeas','7441318629','Random calle ');

DROP TABLE IF EXISTS `parentesco`;
CREATE TABLE IF NOT EXISTS `parentesco` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `name_conyuge` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `a_materno_conyuge` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `a_paterno_conyuge` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `cel_conyuge` varchar (20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `parentesco`
  ADD CONSTRAINT `parentesco_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

DELIMITER //

CREATE TRIGGER after_insert_id_costumer 
AFTER INSERT ON customers 
FOR EACH ROW 
BEGIN
    INSERT INTO parentesco SET customer_id = NEW.id;
END;
//

DELIMITER ;
DROP trigger after_insert_id_costumer ;

DROP TABLE IF EXISTS `land`;
CREATE TABLE IF NOT EXISTS `land` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_interno` varchar(50) NOT NULL,
  `calle` varchar(250) NOT NULL,
  `lote` int NOT NULL,
  `manzana` varchar(30) NOT NULL,
  `superficie` varchar(50) NOT NULL,
  `precio` float NOT NULL,
  `predial` varchar(50) NOT NULL,
  `escritura` varchar(10) NOT NULL,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



DROP TABLE IF EXISTS `sale`;
CREATE TABLE IF NOT EXISTS `sale` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_customer` int DEFAULT NULL,
  `id_land` int DEFAULT NULL,
  `fecha_venta` date DEFAULT NULL,
  `tipo_venta` varchar(30) NOT NULL,
  `inicial` int DEFAULT NULL,
  `n_cuentas` int DEFAULT NULL,
  `ncuotas_pagadas` int NOT NULL,
  `vendedor` varchar(60) NOT NULL,
  `cuotas` double NOT NULL,
  `deuda_restante` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_customer` (`id_customer`),
  KEY `id_land` (`id_land`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `sale`
  ADD CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sale_ibfk_2` FOREIGN KEY (`id_land`) REFERENCES `land` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

DROP trigger after_insert_sale ;

DELIMITER //

CREATE TRIGGER after_insert_sale
AFTER INSERT ON sale 
FOR EACH ROW 
BEGIN
    INSERT INTO abonos SET id_sale = New.id;
END;
//

DELIMITER ;

DROP TABLE IF EXISTS `abonos`;
CREATE TABLE IF NOT EXISTS `abonos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_sale` int NOT NULL,
  `fecha_abono` date NOT NULL,
  `cuotas_pagadas` int NOT NULL,
  `cuotas_restantes` int NOT NULL,
  `cantidad` int NOT NULL,
  `n_abono` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
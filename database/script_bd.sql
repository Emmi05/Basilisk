create database node;
use node;
drop database node;
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 10-04-2024 a las 20:58:32
-- Versión del servidor: 8.2.0
-- Versión de PHP: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `node`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `abonos`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=724 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `abonos`
--

INSERT INTO `abonos` (`id`, `id_sale`, `fecha_abono`, `cuotas_pagadas`, `cuotas_restantes`, `cantidad`, `n_abono`) VALUES
(545, 260, '2024-03-31', 0, 60, 0, 0),
(546, 260, '2024-03-31', 20, 40, 93333, 20),
(547, 260, '2024-03-31', 22, 38, 9333, 2),
(548, 260, '2024-03-31', 30, 30, 37333, 8),
(549, 260, '2024-03-31', 60, 0, 140000, 30),
(550, 262, '2024-04-01', 0, 25, 0, 0),
(551, 263, '2024-04-02', 0, 30, 0, 0),
(552, 263, '2024-04-02', 12, 18, 56000, 12),
(553, 264, '2024-04-02', 0, 66, 0, 0),
(554, 264, '2024-04-02', 15, 51, 34091, 15),
(555, 264, '2024-04-02', 16, 50, 2273, 1),
(556, 264, '2024-04-02', 65, 1, 111364, 49),
(557, 264, '2024-04-02', 66, 0, 2273, 1),
(558, 265, '2024-04-02', 0, 90, 0, 0),
(559, 266, '2024-04-03', 0, 50, 0, 0),
(560, 266, '2024-04-02', 10, 40, 70000, 10),
(561, 266, '2024-04-02', 30, 20, 140000, 20),
(562, 266, '2024-04-02', 40, 10, 70000, 10),
(563, 266, '2024-04-02', 50, 0, 70000, 10),
(564, 265, '2024-04-02', 30, 60, 56667, 30),
(565, 265, '2024-04-02', 90, 0, 113333, 60),
(566, 267, '2024-04-02', 0, 60, 0, 0),
(567, 267, '2024-04-02', 20, 40, 80000, 20),
(568, 267, '2024-04-02', 30, 30, 40000, 10),
(569, 267, '2024-04-02', 40, 20, 40000, 10),
(570, 267, '2024-04-02', 60, 0, 80000, 20),
(571, 268, '2024-04-02', 0, 30, 0, 0),
(572, 268, '2024-04-02', 10, 20, 50000, 10),
(573, 268, '2024-05-02', 15, 15, 25000, 5),
(574, 268, '2024-06-02', 16, 14, 5000, 1),
(575, 268, '2024-07-02', 17, 13, 5000, 1),
(576, 268, '2024-08-02', 18, 12, 5000, 1),
(577, 268, '2024-09-02', 19, 11, 5000, 1),
(578, 268, '2024-10-02', 20, 10, 5000, 1),
(579, 268, '2024-04-02', 21, 9, 5000, 1),
(580, 268, '2024-11-02', 22, 8, 5000, 1),
(581, 268, '2024-12-02', 23, 7, 5000, 1),
(582, 268, '2024-04-02', 24, 6, 5000, 1),
(583, 268, '2025-01-02', 25, 5, 5000, 1),
(584, 268, '2025-02-03', 26, 4, 5000, 1),
(585, 270, '2024-04-03', 0, 10, 0, 0),
(586, 270, '2024-05-03', 1, 9, 9000, 1),
(587, 270, '2024-06-03', 10, 0, 81000, 9),
(588, 268, '2024-04-03', 27, 3, 5000, 1),
(589, 268, '2024-08-03', 28, 2, 5000, 1),
(590, 268, '2024-04-03', 29, 1, 5000, 1),
(591, 271, '2024-04-03', 0, 24, 0, 0),
(592, 271, '2024-04-03', 1, 23, 12500, 1),
(593, 268, '2024-04-03', 30, 0, 5000, 1),
(594, 271, '2024-04-12', 2, 22, 12500, 1),
(595, 271, '2024-05-05', 3, 21, 12500, 1),
(596, 271, '2024-04-05', 4, 20, 12500, 1),
(597, 271, '2024-04-05', 5, 19, 12500, 1),
(598, 271, '2024-04-05', 6, 18, 12500, 1),
(599, 271, '2024-04-05', 7, 17, 12500, 1),
(600, 271, '2024-04-26', 8, 16, 12500, 1),
(601, 271, '2024-05-10', 9, 15, 12500, 1),
(602, 271, '2024-05-11', 10, 14, 12500, 1),
(603, 271, '2024-04-29', 11, 13, 12500, 1),
(604, 271, '2024-04-05', 12, 12, 12500, 1),
(605, 271, '2024-05-19', 13, 11, 12500, 1),
(606, 271, '2024-04-06', 14, 10, 12500, 1),
(607, 271, '2024-04-06', 15, 9, 12500, 1),
(608, 271, '2024-04-06', 16, 8, 12500, 1),
(609, 271, '2024-04-06', 17, 7, 12500, 1),
(610, 271, '2024-04-06', 18, 6, 12500, 1),
(611, 271, '2024-04-06', 19, 5, 12500, 1),
(612, 271, '2024-04-06', 20, 4, 12500, 1),
(613, 271, '2024-04-06', 21, 3, 12500, 1),
(614, 271, '2024-04-06', 22, 2, 12500, 1),
(615, 271, '2024-04-06', 23, 1, 12500, 1),
(616, 271, '2024-04-06', 24, 0, 12500, 1),
(617, 272, '2024-04-06', 0, 30, 0, 0),
(618, 272, '2024-04-06', 1, 29, 5000, 1),
(619, 272, '2024-04-06', 2, 28, 5000, 1),
(620, 272, '2024-04-06', 3, 27, 5000, 1),
(621, 272, '2024-04-06', 4, 26, 5000, 1),
(622, 272, '2024-04-13', 5, 25, 5000, 1),
(623, 272, '2024-04-10', 6, 24, 5000, 1),
(624, 272, '2024-04-13', 7, 23, 5000, 1),
(625, 272, '2024-04-13', 8, 22, 5000, 1),
(626, 272, '2024-04-06', 9, 21, 5000, 1),
(627, 272, '2024-04-06', 10, 20, 5000, 1),
(628, 272, '2024-04-06', 11, 19, 5000, 1),
(629, 272, '2024-04-06', 12, 18, 5000, 1),
(630, 272, '2024-04-06', 13, 17, 5000, 1),
(631, 272, '2024-04-23', 14, 16, 5000, 1),
(632, 272, '2024-04-24', 15, 15, 5000, 1),
(633, 272, '2024-04-21', 16, 14, 5000, 1),
(634, 272, '2024-04-06', 17, 13, 5000, 1),
(635, 272, '2024-04-26', 18, 12, 5000, 1),
(636, 272, '2024-04-27', 19, 11, 5000, 1),
(637, 272, '2024-04-26', 20, 10, 5000, 1),
(638, 272, '2024-04-06', 21, 9, 5000, 1),
(639, 272, '2024-04-16', 22, 8, 5000, 1),
(640, 272, '2024-04-16', 23, 7, 5000, 1),
(641, 272, '2024-04-06', 24, 6, 5000, 1),
(642, 272, '2024-04-19', 25, 5, 5000, 1),
(643, 272, '2024-04-22', 26, 4, 5000, 1),
(644, 272, '2024-04-11', 27, 3, 5000, 1),
(645, 272, '2024-04-28', 28, 2, 5000, 1),
(646, 272, '2024-05-01', 29, 1, 5000, 1),
(647, 272, '2024-05-08', 30, 0, 5000, 1),
(648, 273, '2024-04-07', 0, 80, 0, 0),
(649, 273, '2024-04-08', 1, 79, 4375, 1),
(650, 273, '2024-05-02', 2, 78, 4375, 1),
(651, 273, '2024-05-10', 3, 77, 4375, 1),
(652, 273, '2024-04-18', 4, 76, 4375, 1),
(653, 273, '2024-04-30', 5, 75, 4375, 1),
(654, 273, '2024-04-26', 6, 74, 4375, 1),
(655, 273, '2024-04-19', 7, 73, 4375, 1),
(656, 273, '2024-04-25', 8, 72, 4375, 1),
(657, 273, '2024-04-10', 9, 71, 4375, 1),
(658, 273, '2024-04-17', 10, 70, 4375, 1),
(659, 273, '2024-04-25', 11, 69, 4375, 1),
(660, 273, '2024-04-26', 12, 68, 4375, 1),
(661, 273, '2024-04-05', 13, 67, 4375, 1),
(662, 273, '2024-04-09', 14, 66, 4375, 1),
(663, 273, '2024-04-10', 15, 65, 4375, 1),
(664, 273, '2024-04-09', 16, 64, 4375, 1),
(665, 273, '2024-04-09', 17, 63, 4375, 1),
(666, 273, '2024-04-09', 18, 62, 4375, 1),
(667, 273, '2024-04-08', 19, 61, 4375, 1),
(668, 273, '2024-04-08', 20, 60, 4375, 1),
(669, 273, '2024-04-08', 21, 59, 4375, 1),
(670, 273, '2024-04-08', 22, 58, 4375, 1),
(671, 273, '2024-04-09', 23, 57, 4375, 1),
(672, 273, '2024-04-08', 24, 56, 4375, 1),
(673, 273, '2024-04-08', 25, 55, 4375, 1),
(674, 273, '2024-04-08', 26, 54, 4375, 1),
(675, 273, '2024-04-08', 27, 53, 4375, 1),
(676, 273, '2024-04-08', 28, 52, 4375, 1),
(677, 273, '2024-04-23', 29, 51, 4375, 1),
(678, 273, '2024-04-08', 30, 50, 4375, 1),
(679, 273, '2024-04-08', 31, 49, 4375, 1),
(680, 273, '2024-04-08', 32, 48, 4375, 1),
(681, 273, '2024-04-08', 33, 47, 4375, 1),
(682, 273, '2024-04-08', 34, 46, 4375, 1),
(683, 273, '2024-04-08', 35, 45, 4375, 1),
(684, 273, '2024-04-08', 36, 44, 4375, 1),
(685, 273, '2024-04-08', 37, 43, 4375, 1),
(686, 273, '2024-04-08', 38, 42, 4375, 1),
(687, 273, '2024-04-08', 39, 41, 4375, 1),
(688, 273, '2024-04-08', 40, 40, 4375, 1),
(689, 273, '2024-04-08', 41, 39, 4375, 1),
(690, 273, '2024-04-08', 42, 38, 4375, 1),
(691, 273, '2024-04-08', 43, 37, 4375, 1),
(692, 273, '2024-04-08', 44, 36, 4375, 1),
(693, 273, '2024-04-08', 45, 35, 4375, 1),
(694, 273, '2024-04-08', 46, 34, 4375, 1),
(695, 273, '2024-04-09', 47, 33, 4375, 1),
(696, 273, '2024-04-09', 48, 32, 4375, 1),
(697, 273, '2024-04-08', 49, 31, 4375, 1),
(698, 273, '2024-04-08', 50, 30, 4375, 1),
(699, 273, '2024-04-08', 51, 29, 4375, 1),
(700, 273, '2024-04-08', 52, 28, 4375, 1),
(701, 273, '2024-04-08', 53, 27, 4375, 1),
(702, 273, '2024-04-08', 54, 26, 4375, 1),
(703, 273, '2024-04-08', 55, 25, 4375, 1),
(704, 273, '2024-04-08', 56, 24, 4375, 1),
(705, 273, '2024-04-08', 57, 23, 4375, 1),
(706, 273, '2024-04-08', 58, 22, 4375, 1),
(707, 273, '2024-04-08', 59, 21, 4375, 1),
(708, 273, '2024-04-08', 60, 20, 4375, 1),
(709, 273, '2024-04-08', 61, 19, 4375, 1),
(710, 273, '2024-04-08', 62, 18, 4375, 1),
(711, 273, '2024-04-08', 63, 17, 4375, 1),
(712, 273, '2024-04-08', 64, 16, 4375, 1),
(713, 273, '2024-04-08', 65, 15, 4375, 1),
(714, 273, '2024-04-08', 66, 14, 4375, 1),
(715, 273, '2024-04-08', 67, 13, 4375, 1),
(716, 273, '2024-04-08', 68, 12, 4375, 1),
(717, 273, '2024-04-08', 69, 11, 4375, 1),
(718, 273, '2024-04-08', 70, 10, 4375, 1),
(719, 273, '2024-04-08', 71, 9, 4375, 1),
(720, 273, '2024-04-08', 72, 8, 4375, 1),
(721, 273, '2024-04-08', 73, 7, 4375, 1),
(722, 273, '2024-04-08', 74, 6, 4375, 1),
(723, 273, '2024-04-08', 75, 5, 4375, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `a_materno` varchar(50) NOT NULL,
  `a_paterno` varchar(50) NOT NULL,
  `cel` int NOT NULL,
  `adress` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `customers`
--

INSERT INTO `customers` (`id`, `name`, `a_materno`, `a_paterno`, `cel`, `adress`) VALUES
(3, 'Emma', 'Carmona', 'Flores', 2147483647, '2DA CERRADA DE CASTILLO BRETON 23'),
(18, 'IXCHELL', 'NAZARIO', 'SALGADO', 2147483647, '2DA CERRADA DE CASTILLO BRETON 23'),
(19, 'KAORY', 'NAZARIO', 'SALGADO', 2147483647, 'JARDIN'),
(24, 'Rosa Genesis', 'Carmona', 'Flores ', 2147483647, 'Cancun '),
(25, 'Rogelio', 'Jolleño', 'Flores', 2147483647, 'Calzada pie de la cuesta 13F, Mozimba'),
(28, 'Mariel', 'Flores', 'Barragan', 2147483647, 'Zihuatanejo y Acapulco'),
(29, 'Alberto', 'nose', 'barragan', 2147483647, 'zihua'),
(30, 'usuario', 'flores', 'usuario', 2147483647, 'Calzada pie de la cuesta 13F, Mozimba');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `land`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `land`
--

INSERT INTO `land` (`id`, `id_interno`, `calle`, `lote`, `manzana`, `superficie`, `precio`, `predial`, `escritura`, `estado`) VALUES
(21, '1234543.2348/34', 'Hermegildo Galeana 23', 5, '52', '150', 200000, '128-103-015-000', 'no', 'disponible'),
(22, '1234543.2348/38', 'Hermegildo Galeana 09', 2, '52-A', '150', 300000, '128-103-015-098', 'no', 'pagado'),
(31, '1234543.2348/31', 'Hermegildo Galeana 23', 1, '1', '250', 500000, '128-103-015-031', 'no', 'proceso'),
(32, '1234543.2348/30', 'nodebetenerpunto', 6, '6', '300', 250000, '128-103-015-010', 'no', 'disponible'),
(33, '1234543.2349/03', 'Hermegildo Galeana ', 9, 'A-5', '150', 300000, '128-103-017-003', 'si', 'disponible'),
(35, '1234543.3048/32', 'Hermegildo Galeana 23', 8, '49', '300', 300000, '120-103-015-532', 'no', 'pagado'),
(36, '2314543.2347/90', 'no se', 3, '3', '500', 190000, '281-103-000-876', 'no', 'disponible'),
(37, '2134543.2349/36', 'Hermegildo Galeana 23', 4, '4', '300', 600000, '198-303-015-905', 'si', 'disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parentesco`
--

DROP TABLE IF EXISTS `parentesco`;
CREATE TABLE IF NOT EXISTS `parentesco` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `name_conyuge` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `a_materno_conyuge` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `a_paterno_conyuge` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `cel_conyuge` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `parentesco`
--

INSERT INTO `parentesco` (`id`, `customer_id`, `name_conyuge`, `a_materno_conyuge`, `a_paterno_conyuge`, `cel_conyuge`) VALUES
(6, 18, 'Kaory', 'Nazario', 'Salgado', 2147483647),
(7, 19, 'EMMA', 'CARMMONA', 'FLORES', 234567890),
(11, 3, 'Rosa Genesis', 'aaaa', 'wufwuf', 2147483647),
(15, 24, '', '', '', 0),
(16, 25, 'Ana Cecilia', 'Alvarez', 'Montalvo', 2147483647),
(18, 29, 'jessica', 'carmona', 'flores', 2147483647);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sale`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=274 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sale`
--

INSERT INTO `sale` (`id`, `id_customer`, `id_land`, `fecha_venta`, `tipo_venta`, `inicial`, `n_cuentas`, `ncuotas_pagadas`, `vendedor`, `cuotas`, `deuda_restante`) VALUES
(267, 30, 35, '2024-04-02', 'credito', 60000, 60, 60, 'ixchel salgado Nazario', 4000, 0),
(272, 25, 22, '2024-04-06', 'credito', 150000, 30, 30, 'Emma Flores', 5000, 0),
(273, 19, 31, '2024-04-07', 'credito', 150000, 80, 75, 'Emma Flores', 4375, 21875);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `pass` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `user`, `name`, `rol`, `pass`) VALUES
(36, 'Emma', 'Emma Flores', 'admin', '$2a$08$gm5gndMHGEk30lrFhruAw.rVjcymhsi28KIuP3hIhg4upf5zKtq3m'),
(38, 'Elias', 'Elias Flores Olea', 'usuario', '$2a$08$nUZOAd9iZJEz2bVIAevZLOFNjg2iN5z7AIH/.YNmEZsMK.Yg/8H/q'),
(55, 'ixchell', 'ixchel salgado Nazario', 'usuario', '$2a$08$17G3w9XwGFqEBVz0tE9KX.6jjMbycH2E6zRhYN26mWuKOK4OHce8W'),
(57, 'ayudamedios3', 'sdfgttmvmg', 'admin', '$2a$08$B368z9aj6NKEMMhMaiwWTuMCDZSNoYS6Zxo2b/zRW5blLfXjp8T1i'),
(58, 'randomuser12', 'flores flores', 'admin', '$2a$08$jeQl8KNalipB/kVXm/sEG.iTe67MkDgjXlx8eiqHPXRCaOpIxEVEW'),
(59, 'randomusrt', '{+++--x..cvb', 'usuario', '$2a$08$/LfSVEWfU45vjN9bqnP0KOM9dim7ngnlINSZAsiL.9eVicbNTWwRK'),
(60, 'emma_flores', 'Emma Flores Carmona', 'admin', '$2a$08$.cO0UQDFneDD.CsHqGXg5uKyUBK8IHfKnZ6cWQ5ruFRhK9t4euOm6'),
(61, 'algomasque', 'select user from users', 'usuario', '$2a$08$U6ju9b9O09c.zo7zz.MTaOAHQImhE1XeXhRuZAug5sTroj6bw84TC'),
(62, 'NOPUEDESERAYUDA', 'AYUDAPOLICIA', 'usuario', '$2a$08$Zf3iraTcOZd7mjQ5boWhaecDffQPh.rEpjAOsBtG8hDY69ybLyhsO'),
(63, 'angel', 'Angel de jesus Cano cruz', 'usuario', '$2a$08$NRENpSftWgZW5R8sLz.PrufqXKpdY4E2OLihTPhyEV/T.wOFnrqBK');

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `parentesco`
--
ALTER TABLE `parentesco`
  ADD CONSTRAINT `parentesco_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Filtros para la tabla `sale`
--
ALTER TABLE `sale`
  ADD CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sale_ibfk_2` FOREIGN KEY (`id_land`) REFERENCES `land` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

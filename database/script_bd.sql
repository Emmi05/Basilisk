create database node;
use node;
drop database node;

create table rol(
id_rol int auto_increment,
rol varchar (50),
primary key(id_rol)
);

create table user(
id_user int auto_increment,
diplay_name varchar(255),
user_name varchar (255),
pass varchar (255),
rol varchar (50),
primary key(id_user)
)ENGINE=InnoDB;


create table customer(
id int auto_increment,
name varchar (150),
cel int (10),
conyuge_name varchar (150),
conyuge_cel int (10),
adress varchar (150),
primary key (id));

create table land(
id int auto_increment,
id_interno varchar (50),
calle varchar (100),
lote int (5),
manzana int (5),
superficie varchar (50),
precio int (10),
predial varchar (50),
escritura varchar (10),
estado varchar (50),
primary key (id));


CREATE TABLE sale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT,
    nombre_cliente varchar (150),
    id_land INT,
    id_interno VARCHAR(50),
    fecha_venta DATETIME,
    precio INT(40),
    cantidad_escrita VARCHAR(50),
    FOREIGN KEY (id_cliente) REFERENCES customer(id),
    FOREIGN KEY (id_terreno) REFERENCES land(id)
);
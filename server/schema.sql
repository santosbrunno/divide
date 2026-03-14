-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS divide_app;
USE divide_app;

-- Tabela de Usuários (Motoristas e Passageiros)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(15) UNIQUE NOT NULL,
    tipo_perfil ENUM('driver', 'passenger', 'admin') NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cnh VARCHAR(20),
    status_motorista ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir o único Admin do sistema
INSERT IGNORE INTO users (nome, cpf, tipo_perfil, email, senha) 
VALUES ('Administrador', '00000000000', 'admin', 'admin@divide.com', 'admin123');

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    plate VARCHAR(10) UNIQUE NOT NULL,
    color VARCHAR(50),
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- Tabela de Caronas (Rides)
CREATE TABLE IF NOT EXISTS rides (
    ride_id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    origem VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    data_partida DATETIME NOT NULL,
    vagas_disponiveis INT NOT NULL,
    preco_base DECIMAL(10, 2) NOT NULL,
    status_carona ENUM('aberta', 'finalizada', 'cancelada') DEFAULT 'aberta',
    FOREIGN KEY (driver_id) REFERENCES users(user_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- Tabela de Reservas (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    passenger_id INT NOT NULL,
    status ENUM('pendente', 'confirmado', 'cancelado') DEFAULT 'pendente',
    valor_pago DECIMAL(10, 2) NOT NULL,
    taxa_plataforma DECIMAL(10, 2) NOT NULL,
    payment_id_mp VARCHAR(255),
    data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(ride_id),
    FOREIGN KEY (passenger_id) REFERENCES users(user_id)
);

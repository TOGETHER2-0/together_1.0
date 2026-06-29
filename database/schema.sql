-- Together DB Schema
-- Run this once to set up the database

CREATE DATABASE IF NOT EXISTS together_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'together_user'@'localhost' IDENTIFIED BY 'together_pass';
GRANT ALL PRIVILEGES ON together_db.* TO 'together_user'@'localhost';
FLUSH PRIVILEGES;

USE together_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    faculty VARCHAR(50),
    avatar_color VARCHAR(7) DEFAULT '#6366f1',
    bio TEXT,
    avatar_url MEDIUMTEXT,
    country_code VARCHAR(2),
    language VARCHAR(5) DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_datetime DATETIME NOT NULL,
    location_text VARCHAR(255) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    location_maps_url VARCHAR(500),
    max_participants INT DEFAULT NULL,
    host_id INT NOT NULL,
    accommodation VARCHAR(255),
    floor INT,
    category VARCHAR(20) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_datetime (event_datetime),
    INDEX idx_host_id (host_id)
);

CREATE TABLE IF NOT EXISTS join_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_join (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS event_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_messages_event_created (event_id, created_at)
);

-- MySQL Setup for YSI Backend
-- This script runs automatically when MySQL container starts

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ysi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE ysi_db;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'ysi_user'@'%' IDENTIFIED BY 'ysi_mysql_password';
GRANT ALL PRIVILEGES ON ysi_db.* TO 'ysi_user'@'%';
FLUSH PRIVILEGES;

-- Log successful initialization
SELECT 'MySQL database and user created successfully' AS status;

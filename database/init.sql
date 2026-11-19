-- Microservices Database Initialization
-- Creates isolated databases for user-service and product-service

CREATE DATABASE users_db;
CREATE DATABASE products_db;

GRANT ALL PRIVILEGES ON DATABASE users_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE products_db TO postgres;
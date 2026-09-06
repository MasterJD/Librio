-- Create databases and users for each microservice
-- Each service has its own database and user (principle of least privilege)

-- Catalog service
CREATE USER catalog_user WITH PASSWORD 'catalog_pass';
CREATE DATABASE catalog_db OWNER catalog_user;
GRANT ALL PRIVILEGES ON DATABASE catalog_db TO catalog_user;

-- Users service
CREATE USER users_user WITH PASSWORD 'users_pass';
CREATE DATABASE users_db OWNER users_user;
GRANT ALL PRIVILEGES ON DATABASE users_db TO users_user;

-- Transaction service
CREATE USER transaction_user WITH PASSWORD 'transaction_pass';
CREATE DATABASE transaction_db OWNER transaction_user;
GRANT ALL PRIVILEGES ON DATABASE transaction_db TO transaction_user;

-- Notification service
CREATE USER notif_user WITH PASSWORD 'notif_pass';
CREATE DATABASE notif_db OWNER notif_user;
GRANT ALL PRIVILEGES ON DATABASE notif_db TO notif_user;

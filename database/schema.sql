-- Stock Management System (SMS) Database
-- StockHub Ltd - Kigali City, Rwanda

CREATE DATABASE IF NOT EXISTS SMS;
USE SMS;

-- User accounts for authentication
CREATE TABLE IF NOT EXISTS User (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse entity
CREATE TABLE IF NOT EXISTS Warehouse (
  warehouseCode VARCHAR(20) PRIMARY KEY,
  warehouseName VARCHAR(100) NOT NULL,
  warehouseLocation VARCHAR(150) NOT NULL
);

-- Product entity
CREATE TABLE IF NOT EXISTS Product (
  productCode VARCHAR(20) PRIMARY KEY,
  productName VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantityInStock INT NOT NULL DEFAULT 0 CHECK (quantityInStock >= 0),
  unitPrice DECIMAL(12, 2) NOT NULL,
  supplierName VARCHAR(100) NOT NULL,
  dateReceived DATE NOT NULL,
  warehouseCode VARCHAR(20) NOT NULL,
  FOREIGN KEY (warehouseCode) REFERENCES Warehouse(warehouseCode)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- StockTransaction entity
CREATE TABLE IF NOT EXISTS StockTransaction (
  transactionId INT AUTO_INCREMENT PRIMARY KEY,
  transactionDate DATETIME NOT NULL,
  quantityMoved INT NOT NULL CHECK (quantityMoved > 0),
  transactionType ENUM('IN', 'OUT') NOT NULL,
  productCode VARCHAR(20) NOT NULL,
  warehouseCode VARCHAR(20) NOT NULL,
  FOREIGN KEY (productCode) REFERENCES Product(productCode)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (warehouseCode) REFERENCES Warehouse(warehouseCode)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Default admin: run `npm run seed` in backend-project after schema import

-- Sample data (optional - uncomment for demo)
-- INSERT INTO Warehouse VALUES ('WH001', 'Kigali Central', 'Kigali City, Rwanda');
-- INSERT INTO Product VALUES ('P001', 'Rice 25kg', 'Grains', 100, 25000, 'Rwanda Foods Ltd', '2026-01-15', 'WH001');

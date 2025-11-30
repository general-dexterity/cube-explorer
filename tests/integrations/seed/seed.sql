-- Create tables for a sample e-commerce dataset

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    status VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed products
INSERT INTO products (id, name, category, price) VALUES
(1, 'Wireless Mouse', 'Electronics', 29.99),
(2, 'Mechanical Keyboard', 'Electronics', 89.99),
(3, 'USB-C Hub', 'Electronics', 49.99),
(4, 'Monitor Stand', 'Furniture', 79.99),
(5, 'Desk Lamp', 'Furniture', 34.99),
(6, 'Ergonomic Chair', 'Furniture', 299.99),
(7, 'Notebook Set', 'Office Supplies', 12.99),
(8, 'Pen Pack', 'Office Supplies', 8.99),
(9, 'Webcam HD', 'Electronics', 59.99),
(10, 'Headphones', 'Electronics', 149.99),
(11, 'Standing Desk', 'Furniture', 449.99),
(12, 'Cable Organizer', 'Office Supplies', 15.99),
(13, 'Laptop Stand', 'Electronics', 39.99),
(14, 'Whiteboard', 'Office Supplies', 89.99),
(15, 'Desk Mat', 'Office Supplies', 24.99);

-- Seed customers
INSERT INTO customers (id, name, email, city, country) VALUES
(1, 'Alice Johnson', 'alice@example.com', 'New York', 'USA'),
(2, 'Bob Smith', 'bob@example.com', 'Los Angeles', 'USA'),
(3, 'Charlie Brown', 'charlie@example.com', 'London', 'UK'),
(4, 'Diana Ross', 'diana@example.com', 'Paris', 'France'),
(5, 'Eva Martinez', 'eva@example.com', 'Madrid', 'Spain'),
(6, 'Frank Wilson', 'frank@example.com', 'Berlin', 'Germany'),
(7, 'Grace Lee', 'grace@example.com', 'Tokyo', 'Japan'),
(8, 'Henry Chen', 'henry@example.com', 'Toronto', 'Canada'),
(9, 'Ivy Taylor', 'ivy@example.com', 'Sydney', 'Australia'),
(10, 'Jack Davis', 'jack@example.com', 'Amsterdam', 'Netherlands');

-- Seed orders with various statuses and dates
INSERT INTO orders (id, customer_id, status, created_at, completed_at) VALUES
(1, 1, 'completed', '2024-01-15 10:30:00', '2024-01-18 14:00:00'),
(2, 2, 'completed', '2024-01-20 14:45:00', '2024-01-23 09:30:00'),
(3, 3, 'completed', '2024-02-01 09:15:00', '2024-02-04 16:00:00'),
(4, 1, 'completed', '2024-02-10 16:00:00', '2024-02-13 11:00:00'),
(5, 4, 'shipped', '2024-02-15 11:30:00', NULL),
(6, 5, 'completed', '2024-02-20 08:00:00', '2024-02-23 15:00:00'),
(7, 6, 'processing', '2024-03-01 13:45:00', NULL),
(8, 7, 'completed', '2024-03-05 10:00:00', '2024-03-08 12:00:00'),
(9, 2, 'completed', '2024-03-10 15:30:00', '2024-03-13 10:00:00'),
(10, 8, 'shipped', '2024-03-15 09:00:00', NULL),
(11, 9, 'completed', '2024-03-20 14:00:00', '2024-03-23 16:00:00'),
(12, 10, 'completed', '2024-04-01 11:00:00', '2024-04-04 09:00:00'),
(13, 3, 'processing', '2024-04-05 16:30:00', NULL),
(14, 4, 'completed', '2024-04-10 08:45:00', '2024-04-13 14:00:00'),
(15, 5, 'completed', '2024-04-15 12:00:00', '2024-04-18 11:00:00'),
(16, 1, 'shipped', '2024-04-20 10:30:00', NULL),
(17, 6, 'completed', '2024-05-01 09:00:00', '2024-05-04 15:00:00'),
(18, 7, 'completed', '2024-05-05 14:15:00', '2024-05-08 10:00:00'),
(19, 8, 'processing', '2024-05-10 11:45:00', NULL),
(20, 9, 'completed', '2024-05-15 16:00:00', '2024-05-18 12:00:00'),
(21, 10, 'completed', '2024-06-01 08:30:00', '2024-06-04 14:00:00'),
(22, 2, 'shipped', '2024-06-05 13:00:00', NULL),
(23, 3, 'completed', '2024-06-10 10:45:00', '2024-06-13 09:00:00'),
(24, 4, 'completed', '2024-06-15 15:30:00', '2024-06-18 16:00:00'),
(25, 5, 'pending', '2024-06-20 09:15:00', NULL);

-- Seed order items
INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES
(1, 1, 1, 2, 29.99),
(2, 1, 2, 1, 89.99),
(3, 2, 3, 1, 49.99),
(4, 2, 5, 2, 34.99),
(5, 3, 6, 1, 299.99),
(6, 3, 4, 1, 79.99),
(7, 4, 10, 1, 149.99),
(8, 4, 9, 1, 59.99),
(9, 5, 11, 1, 449.99),
(10, 5, 15, 2, 24.99),
(11, 6, 7, 3, 12.99),
(12, 6, 8, 5, 8.99),
(13, 7, 2, 2, 89.99),
(14, 7, 1, 3, 29.99),
(15, 8, 13, 1, 39.99),
(16, 8, 12, 2, 15.99),
(17, 9, 14, 1, 89.99),
(18, 9, 15, 1, 24.99),
(19, 10, 10, 2, 149.99),
(20, 10, 9, 1, 59.99),
(21, 11, 6, 1, 299.99),
(22, 11, 5, 1, 34.99),
(23, 12, 3, 2, 49.99),
(24, 12, 1, 1, 29.99),
(25, 13, 11, 1, 449.99),
(26, 13, 4, 2, 79.99),
(27, 14, 2, 1, 89.99),
(28, 14, 7, 4, 12.99),
(29, 15, 10, 1, 149.99),
(30, 15, 13, 2, 39.99),
(31, 16, 8, 10, 8.99),
(32, 16, 12, 3, 15.99),
(33, 17, 6, 1, 299.99),
(34, 17, 15, 1, 24.99),
(35, 18, 9, 2, 59.99),
(36, 18, 1, 1, 29.99),
(37, 19, 14, 2, 89.99),
(38, 19, 5, 1, 34.99),
(39, 20, 11, 1, 449.99),
(40, 20, 3, 1, 49.99),
(41, 21, 2, 1, 89.99),
(42, 21, 10, 1, 149.99),
(43, 22, 4, 1, 79.99),
(44, 22, 13, 1, 39.99),
(45, 23, 7, 2, 12.99),
(46, 23, 8, 3, 8.99),
(47, 24, 1, 4, 29.99),
(48, 24, 15, 2, 24.99),
(49, 25, 6, 1, 299.99),
(50, 25, 9, 1, 59.99);

CREATE DATABASE restaurantDB;
USE restaurantDB;


CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(30),
    customer_contact VARCHAR(255),
    payment_mode VARCHAR(30),
    payment_method VARCHAR(50),
    payment_status VARCHAR(30),
    payment_reference VARCHAR(255),
    grandTotal DECIMAL(10,2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    name VARCHAR(255),
    price DECIMAL(10,2),
    quantity INT,
    total DECIMAL(10,2),
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

CREATE TABLE bill_otp_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    contact VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    is_used TINYINT(1) DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);
SELECT * FROM bill_otp_requests;

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    date VARCHAR(50),
    time VARCHAR(50),
    people INT,
    payment_mode VARCHAR(30),
    payment_method VARCHAR(50),
    payment_status VARCHAR(30),
    payment_reference VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from bookings;

CREATE TABLE payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    payment_intent_id VARCHAR(255),
    amount_paid DECIMAL(10,2),
    currency VARCHAR(10),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
SELECT * FROM payment_transactions;

CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    guest_count INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Select * from contact_messages;

CREATE TABLE feedback_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    rating INT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM feedback_messages;

CREATE TABLE blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) DEFAULT 'Guest',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM blog_posts;

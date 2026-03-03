const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const initQueries = [
    `CREATE TABLE IF NOT EXISTS bills (
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
    )`,
    `ALTER TABLE bills ADD COLUMN customer_name VARCHAR(255)`,
    `ALTER TABLE bills ADD COLUMN customer_phone VARCHAR(30)`,
    `ALTER TABLE bills ADD COLUMN customer_contact VARCHAR(255)`,
    `ALTER TABLE bills ADD COLUMN payment_mode VARCHAR(30)`,
    `ALTER TABLE bills ADD COLUMN payment_method VARCHAR(50)`,
    `ALTER TABLE bills ADD COLUMN payment_status VARCHAR(30)`,
    `ALTER TABLE bills ADD COLUMN payment_reference VARCHAR(255)`,

    `CREATE TABLE IF NOT EXISTS bill_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_id INT,
        name VARCHAR(255),
        price DECIMAL(10,2),
        quantity INT,
        total DECIMAL(10,2),
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS bill_otp_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_id INT NOT NULL,
        contact VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        is_used TINYINT(1) DEFAULT 0,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS bookings (
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
    )`,
    `ALTER TABLE bookings ADD COLUMN payment_mode VARCHAR(30)`,
    `ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50)`,
    `ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(30)`,
    `ALTER TABLE bookings ADD COLUMN payment_reference VARCHAR(255)`,
    `ALTER TABLE bookings MODIFY COLUMN date VARCHAR(50)`,
    `ALTER TABLE bookings MODIFY COLUMN time VARCHAR(50)`,

    `CREATE TABLE IF NOT EXISTS payment_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        session_id VARCHAR(255) NOT NULL UNIQUE,
        payment_intent_id VARCHAR(255),
        amount_paid DECIMAL(10,2),
        currency VARCHAR(10),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150),
        guest_count INT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS feedback_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150),
        rating INT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'Guest',
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

const runInitQueries = (queries, index = 0) => {
    if (index >= queries.length) {
        console.log("Database schema check complete");
        return;
    }

    db.query(queries[index], (err) => {
        if (err) {
            const ignorableCodes = new Set(["ER_DUP_FIELDNAME", "ER_CANT_DROP_FIELD_OR_KEY", "ER_BAD_FIELD_ERROR"]);
            if (!ignorableCodes.has(err.code)) {
                console.error("Schema init query failed:", err.sqlMessage || err.message);
            }
        }
        runInitQueries(queries, index + 1);
    });
};

db.connect((err) => {
    if (err) {
        console.error("MySQL Connection Failed:", err);
    } else {
        console.log("MySQL Connected");
        runInitQueries(initQueries);
    }
});

module.exports = db;

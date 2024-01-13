-- Tabel untuk pengguna
CREATE TABLE
    users (
        users_id VARCHAR PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        is_online BOOLEAN DEFAULT FALSE,
        last_online TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    messages (
        message_id VARCHAR PRIMARY KEY,
        sender_id VARCHAR REFERENCES users(users_id) NOT NULL,
        receiver_id VARCHAR REFERENCES users(users_id) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE, 
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


DROP Table messages


USE userdb;

DROP TABLE IF EXISTS persistent_logins;
DROP TABLE IF EXISTS single_use_tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,	
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    bio TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    refresh_token VARCHAR(255) NULL,
    refresh_token_expires_at TIMESTAMP NULL,
    last_active_at TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS single_use_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('VERIFY_EMAIL', 'RESET_PASSWORD') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_type (token, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

show tables;

INSERT INTO users (
    username, email, password_hash, full_name, avatar_url, bio, refresh_token, refresh_token_expires_at, last_active_at
) VALUES
('john_doe', 'john@example.com', '1234', 'John Doe', 'https://example.com/avatars/john.jpg', 'I love coding and coffee.', NULL, NULL, NOW()),
('jane_smith', 'jane@example.com', '1234', 'Jane Smith', 'https://example.com/avatars/jane.jpg', 'Full-stack developer and traveler.', NULL, NULL, NOW()),
('mike_nguyen', 'mike@example.com', '1234', 'Mike Nguyen', 'https://example.com/avatars/mike.jpg', 'Tech enthusiast and blogger.', NULL, NULL, NOW());

select * from users;
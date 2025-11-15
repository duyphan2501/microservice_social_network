USE frienddb;

DROP TABLE IF EXISTS friend_relationships;

-- Bảng friend_relationships
CREATE TABLE IF NOT EXISTS friend_relationships (
    user_id_1 BIGINT UNSIGNED NOT NULL,
    user_id_2 BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'blocked') NOT NULL,
    action_user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id_1, user_id_2), -- Đảm bảo cặp ID là duy nhất (nên lưu ID nhỏ trước)
    INDEX idx_user_id_2 (user_id_2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

show tables;

use notificationdb;

DROP TABLE IF EXISTS notifications;

-- Bảng notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NULL,
    type ENUM('post_like', 'post_comment', 'friend_request', 'friend_accepted', 'new_message', "new_friend_post") NOT NULL,
    entity_type ENUM('post', 'comment', 'user', 'message') NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,
    content VARCHAR(255) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

show tables;

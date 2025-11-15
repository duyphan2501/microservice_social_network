USE chatdb;
ALTER TABLE conversations DROP FOREIGN KEY fk_last_message;
-- Xóa các bảng theo thứ tự phụ thuộc để tránh lỗi khóa ngoại
DROP TABLE IF EXISTS message_statuses;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

-- Bảng conversations (Hội thoại 1-1)
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id_1 BIGINT UNSIGNED NOT NULL,
    user_id_2 BIGINT UNSIGNED NOT NULL,
    last_message_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Đảm bảo mỗi cặp user chỉ có 1 cuộc hội thoại (lưu ID nhỏ trước)
    UNIQUE KEY unique_conversation (user_id_1, user_id_2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	
-- Bảng messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm khóa ngoại cho last_message_id (sau khi messages đã tồn tại)
ALTER TABLE conversations
ADD CONSTRAINT fk_last_message
FOREIGN KEY (last_message_id) REFERENCES messages(id)
ON DELETE SET NULL;

-- Bảng message_statuses (Trạng thái đã xem/chưa xem của từng người nhận)
CREATE TABLE IF NOT EXISTS message_statuses (
    message_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('sent', 'delivered', 'read') NOT NULL DEFAULT 'sent',
    read_at TIMESTAMP NULL,
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kiểm tra kết quả
SHOW TABLES;

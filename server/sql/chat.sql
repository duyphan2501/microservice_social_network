USE chatdb;
ALTER TABLE conversations DROP FOREIGN KEY fk_last_message;
-- Xóa các bảng theo thứ tự phụ thuộc để tránh lỗi khóa ngoại
DROP TABLE IF EXISTS message_media;
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
    content TEXT NULL, -- Cho phép NULL nếu tin nhắn chỉ có ảnh mà không có text
    type ENUM('text', 'image') NOT NULL DEFAULT 'text', -- Loại tin nhắn
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    media_count SMALLINT DEFAULT 0,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT UNSIGNED NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    media_public_id VARCHAR(255),
    media_type ENUM('image', 'video', 'file') NOT NULL DEFAULT 'image',
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_message_id (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm khóa ngoại cho last_message_id (sau khi messages đã tồn tại)
ALTER TABLE conversations
ADD CONSTRAINT fk_last_message
FOREIGN KEY (last_message_id) REFERENCES messages(id)
ON DELETE SET NULL;

-- Bảng message_statuses (Trạng thái đã xem/chưa xem của từng người nhận)
CREATE TABLE IF NOT EXISTS message_statuses (
    message_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NOT NULL,
    status ENUM('sent', 'delivered', 'read') NOT NULL DEFAULT 'sent',
    read_at TIMESTAMP NULL,
    PRIMARY KEY (message_id, receiver_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_receiver_id (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kiểm tra kết quả
	
INSERT INTO conversations (user_id_1, user_id_2)
VALUES 
(1, 2),
(1, 3),
(2, 3);

INSERT INTO messages (conversation_id, sender_id, content, type)
VALUES
(1, 1, 'Chào bạn 2!', 'text'),
(1, 2, 'Chào bạn 1, khoẻ không?', 'text'),
(2, 1, 'Hi bạn 3!', 'text'),
(2, 3, 'Hello, bạn A!', 'text'),
(3, 2, 'Hello bạn 3', 'text'),
(3, 3, 'Hi bạn 2', 'text');

UPDATE conversations SET last_message_id = 2 WHERE id = 1;
UPDATE conversations SET last_message_id = 4 WHERE id = 2;
UPDATE conversations SET last_message_id = 6 WHERE id = 3;

INSERT INTO message_statuses (message_id, receiver_id, status, read_at)
VALUES
(1, 2, 'read', NOW()),
(2, 1, 'read', NOW()),
(3, 3, 'delivered', NULL),
(4, 1, 'sent', NULL),
(5, 3, 'read', NOW()),
(6, 2, 'read', NOW());

-- Bước 1: Thêm tin nhắn ảnh vào bảng messages
-- Sử dụng NULL cho ID để CSDL tự động tạo ID tiếp theo (ví dụ: 7)
INSERT INTO messages (conversation_id, sender_id, content, type, media_count)
VALUES (1, 1, 'Hai ảnh mới nhé!', 'image', 2);

-- Lấy ID của tin nhắn vừa chèn.
-- Đây là cách làm việc trong MySQL:
SET @last_msg_id = LAST_INSERT_ID();

-- Nếu dùng PostgreSQL, bạn sẽ cần cú pháp khác với RETURNING id.

-- Bước 2: Thêm 2 ảnh vào bảng message_media, sử dụng @last_msg_id
INSERT INTO message_media (message_id, media_url, media_type)
VALUES
(@last_msg_id, 'https://images.unsplash.com/photo-1761839257845-9283b7d1b933?ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600', 'image'),
(@last_msg_id, 'https://images.unsplash.com/photo-1762368229295-81f2742fb8a5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600', 'image');

-- Bước 3: Cập nhật last_message_id cho conversation_id 1
UPDATE conversations 
SET last_message_id = @last_msg_id 
WHERE id = 1;	

-- Bước 4: Thêm trạng thái cho tin nhắn (ví dụ: người nhận user 2 đã nhận - delivered)
INSERT INTO message_statuses (message_id, receiver_id, status, read_at)
VALUES (@last_msg_id, 2, 'delivered', NULL);

-- Kiểm tra lại kết quả
SELECT * FROM messages WHERE id = @last_msg_id;
SELECT * FROM message_media WHERE message_id = @last_msg_id;
SELECT * FROM message_statuses WHERE message_id = @last_msg_id;
SELECT * FROM conversations WHERE id = 1;

select * from message_statuses;
SELECT * FROM message_media WHERE message_id = 26;
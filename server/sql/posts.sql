USE postdb;

-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS post_media; 
DROP TABLE IF EXISTS posts;

-- Bảng posts (điều chỉnh: loại bỏ media_url và media_type)
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    likes_count INT UNSIGNED NOT NULL DEFAULT 0,
    comments_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng post_media mới để lưu trữ nhiều tệp media cho một bài đăng
CREATE TABLE IF NOT EXISTS post_media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    media_public_id VARCHAR(255),
    media_type ENUM('image', 'video') NOT NULL,
    display_order INT UNSIGNED NOT NULL DEFAULT 1, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Bảng comments (giữ nguyên)
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    parent_comment_id BIGINT UNSIGNED NULL,
    content TEXT NOT NULL,	
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng likes (giữ nguyên)
CREATE TABLE IF NOT EXISTS likes (
    user_id BIGINT UNSIGNED NOT NULL,
    post_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

show tables;

-- 1. Thêm dữ liệu vào bảng posts

-- Bài đăng 1 (Chỉ văn bản)
INSERT INTO posts (user_id, content, likes_count, comments_count) 
VALUES (1, 'Bài đăng đầu tiên của John Doe, chỉ có văn bản thôi.', 5, 2);

-- Bài đăng 2 (Nhiều ảnh)
INSERT INTO posts (user_id, content, likes_count, comments_count) 
VALUES (2, 'Chào mừng đến với trang của Jane! Đây là bộ sưu tập ảnh phong cảnh tuyệt đẹp.', 15, 5);

-- Bài đăng 3 (Một video)
INSERT INTO posts (user_id, content, likes_count, comments_count) 
VALUES (1, 'Kiểm tra video mới nhất của tôi về lập trình MySQL.', 8, 1);


-- 2. Thêm dữ liệu vào bảng post_media (liên kết với các post_id vừa tạo)

-- Media cho Bài đăng 2 (Post ID 2)
-- Giả sử Post ID đầu tiên được tạo là 1, thứ hai là 2, thứ ba là 3.
-- Bạn có thể kiểm tra ID chính xác sau khi insert posts.

-- Ảnh 1 cho Post ID 2
INSERT INTO post_media (post_id, media_url, media_public_id, media_type, display_order)
VALUES (2, 'https://plus.unsplash.com/premium_photo-1729862338495-855fe034bc8f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8', 'public_id_post2_pic1', 'image', 1);

-- Ảnh 2 cho Post ID 2
INSERT INTO post_media (post_id, media_url, media_public_id, media_type, display_order)
VALUES (2, 'https://images.unsplash.com/photo-1762705402471-8f0cf07d694f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8', 'public_id_post2_pic2', 'image', 2);

-- Ảnh 3 cho Post ID 2
INSERT INTO post_media (post_id, media_url, media_public_id, media_type, display_order)
VALUES (2, 'https://images.unsplash.com/photo-1762838896833-ffb8f3032374?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxM3x8fGVufDB8fHx8fA%3D%3D', 'public_id_post2_pic3', 'image', 3);

-- Media cho Bài đăng 3 (Post ID 3 - Video)
INSERT INTO post_media (post_id, media_url, media_public_id, media_type, display_order)
VALUES (3, 'https://images.unsplash.com/photo-1761839258513-099c3121d72d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNXx8fGVufDB8fHx8fA%3D%3D', 'public_id_post3_video1', 'video', 1);

-- 3. Thêm dữ liệu vào bảng comments

-- Comments cho Bài đăng 2 (Post ID 2)
INSERT INTO comments (post_id, user_id, content) VALUES
(2, 1, 'Bộ ảnh đẹp quá Jane ơi!'),
(2, 2, 'Cảm ơn John! Mình thích tấm thứ 2 nhất.');

-- 4. Thêm dữ liệu vào bảng likes

-- User 1 like Post 2
INSERT INTO likes (user_id, post_id) VALUES (1, 2);

-- User 2 like Post 1 và Post 3
INSERT INTO likes (user_id, post_id) VALUES (2, 1), (2, 3);

-- Replies cho comment id = 1
INSERT INTO comments (post_id, user_id, parent_comment_id, content) VALUES
(2, 2, 1, 'Cảm ơn John nhé ❤️'),
(2, 3, 1, 'Đúng là bộ ảnh quá đẹp luôn, Jane!');

-- Replies cho reply trên (multi-level nesting)
-- Giả sử reply id đầu tiên ở trên là 3
INSERT INTO comments (post_id, user_id, parent_comment_id, content) VALUES
(2, 1, 3, 'Mình chụp bằng máy mới à?'),
(2, 2, 3, 'Đúng rồi, mình mới mua Canon R8 😁');

-- Replies cho comment id = 2
INSERT INTO comments (post_id, user_id, parent_comment_id, content) VALUES
(2, 1, 2, 'Tấm đó có ánh sáng đẹp thật!'),
(2, 4, 2, 'Mình cũng thích góc chụp ấy nè.');


select * from posts where id = 2;

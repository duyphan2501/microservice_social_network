import { pool } from "../database/connectDB.js";

const MessageModel = {
  /**
   * Lưu một tin nhắn mới cùng với các file media liên quan vào cơ sở dữ liệu.
   * Thực hiện trong một transaction để đảm bảo tính nhất quán (tùy thuộc vào cách bạn quản lý DB).
   *
   * @param {object} messageData - Dữ liệu tin nhắn.
   * @param {number} messageData.conversationId - ID cuộc hội thoại.
   * @param {number} messageData.senderId - ID người gửi.
   * @param {string} [messageData.content] - Nội dung tin nhắn (có thể null nếu chỉ có media).
   * @param {'text' | 'image'} [messageData.type] - Loại tin nhắn.
   * @param {Array<{url: string, type: 'image' | 'video' | 'file'}>} [messageData.media] - Mảng các file media.
   * @returns {Promise<number|null>} ID của tin nhắn mới được tạo, hoặc null nếu thất bại.
   */
  saveNewMessage: async (messageData) => {
    const {
      conversationId,
      senderId,
      content,
      type = "text",
      media = [],
    } = messageData;
    let messageId = null;

    // 1. Lấy một kết nối cụ thể từ pool
    const connection = await pool.getConnection();

    try {
      // Bắt đầu transaction trên kết nối đó
      await connection.beginTransaction();

      // 1. Insert vào bảng messages (Dùng 'connection' thay vì 'pool' cho TẤT CẢ các query bên dưới)
      const messageInsertQuery = `
        INSERT INTO messages (conversation_id, sender_id, content, type, media_count)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [messageResult] = await connection.query(messageInsertQuery, [
        // <-- Dùng connection
        conversationId,
        senderId,
        content,
        type,
        media.length,
      ]);
      messageId = messageResult.insertId;

      // 2. Insert vào bảng message_media nếu có media
      if (media.length > 0) {
        const mediaInsertQuery = `
          INSERT INTO message_media (message_id, media_url, media_public_id, media_type)
          VALUES ?
        `;
        const mediaValues = media.map((m) => [messageId, m.url, m.publicId, m.type]);
        await connection.query(mediaInsertQuery, [mediaValues]); // <-- Dùng connection
      }

      // 3. Cập nhật last_message_id trong bảng conversations
      const updateConversationQuery = `
        UPDATE conversations
        SET last_message_id = ?
        WHERE id = ?
      `;
      await connection.query(updateConversationQuery, [
        messageId,
        conversationId,
      ]); // <-- Dùng connection

      // 4. Thêm trạng thái tin nhắn cho người gửi và người nhận (giả định 1-1 chat)
      const [convoRows] = await connection.query(
        // <-- Dùng connection
        "SELECT user_id_1, user_id_2 FROM conversations WHERE id = ?",
        [conversationId]
      );
      if (convoRows.length > 0) {
        const receiverId =
          convoRows[0].user_id_1 === senderId
            ? convoRows[0].user_id_2
            : convoRows[0].user_id_1;

        const statusInsertQuery = `
          INSERT INTO message_statuses (message_id, receiver_id, status)
          VALUES (?, ?, 'sent')
        `;
        await connection.query(statusInsertQuery, [
          messageId,
          receiverId,
          messageId,
        ]);
      }

      // Commit transaction
      await connection.commit();

      return messageId;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await connection.rollback();
      console.error("Lỗi khi lưu tin nhắn mới:", error);
      return null;
    } finally {
      connection.release();
    }
  },

  /**
   * Lấy chi tiết một tin nhắn cụ thể bao gồm media và số lượng người đã xem.
   *
   * @param {number} messageId - ID của tin nhắn cần lấy.
   * @returns {Promise<object|null>} Đối tượng tin nhắn hoàn chỉnh, hoặc null nếu không tìm thấy.
   */
  getMessageById: async (messageId) => {
    const query = `
      SELECT 
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content,
          m.type,
          m.sent_at,
          m.media_count,
          COALESCE(
              JSON_ARRAYAGG(
                  JSON_OBJECT('id', mm.id, 'media_url', mm.media_url, 'media_file_type', mm.media_type)
              ), 
              '[]'
          ) AS media
          
      FROM messages m
      LEFT JOIN message_media mm ON m.id = mm.message_id
      WHERE m.id = ?
      GROUP BY m.id
    `;

    // Giả định `pool` là đối tượng kết nối DB của bạn
    const [rows] = await pool.query(query, [messageId]);

    if (rows.length === 0) {
      return null;
    }

    const message = rows[0];
    // Đảm bảo media_details được parse thành JSON nếu driver DB trả về dưới dạng chuỗi
    if (typeof message.media === "string") {
      message.media = JSON.parse(message.media);
    }
    return message;
  },

  /**
   * Cập nhật trạng thái của một tin nhắn (ví dụ: 'delivered', 'read') cho một người dùng cụ thể.
   *
   * @param {number} messageId - ID của tin nhắn.
   * @param {number} userId - ID của người dùng nhận.
   * @param {'sent' | 'delivered' | 'read'} status - Trạng thái mới.
   * @returns {Promise<boolean>} True nếu cập nhật thành công, false nếu không có dòng nào bị ảnh hưởng.
   */
  markMessageStatus: async (messageId, userId, status) => {
    const query = `
      UPDATE message_statuses
      SET 
          status = ?,
          -- Chỉ cập nhật read_at nếu trạng thái là 'read' (nếu bạn vẫn giữ cột read_at)
          read_at = CASE WHEN ? = 'read' THEN CURRENT_TIMESTAMP ELSE read_at END
      WHERE message_id = ? AND receiver_id = ?
    `;

    // Giả định `pool` là đối tượng kết nối DB của bạn
    const [result] = await pool.query(query, [
      status,
      status,
      messageId,
      userId,
    ]);

    // Trả về true nếu có ít nhất 1 dòng bị ảnh hưởng (cập nhật thành công)
    return result.affectedRows > 0;
  },
};

export default MessageModel;

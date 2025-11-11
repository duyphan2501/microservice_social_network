import { pool } from "../database/connectDB.js";

const ConversationModel = {
  getConversationsByUserId: async (userId) => {
    const query = `
        SELECT
            c.id AS conversation_id,
            CASE
                WHEN c.user_id_1 = ? THEN c.user_id_2
                ELSE c.user_id_1
            END AS other_user_id,
            m.id AS message_id,
            m.sender_id,
            m.content,
            m.type AS message_type, 
            m.sent_at,
            COALESCE(ms.status, 'sent') AS message_status,
            m.media_count
        FROM
            conversations c
        JOIN
            messages m ON c.last_message_id = m.id
        LEFT JOIN
            message_statuses ms ON m.id = ms.message_id AND ms.user_id = ?
        WHERE
            c.user_id_1 = ? OR c.user_id_2 = ?
        ORDER BY
            m.sent_at DESC;
    `;

    try {
      const [rows] = await pool.query(query, [userId, userId, userId, userId]);
      return rows;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw new Error("Could not retrieve conversations");
    }
  },

  getConversationMessagesBy: async (
    conversationId,
    limit,
    beforeId,
    currentUserId
  ) => {
    let query = `
        SELECT 
            m.id AS message_id,
            m.conversation_id,
            m.sender_id,
            m.content,
            m.type AS message_type,
            m.sent_at,
            mm.id AS media_id,
            mm.media_url,
            mm.media_type AS media_file_type,
            COALESCE(ms.status, 'sent') AS message_status 
        FROM 
            messages m
        LEFT JOIN 
            message_media mm ON m.id = mm.message_id
        LEFT JOIN
            message_statuses ms ON m.id = ms.message_id AND ms.user_id = ?

        WHERE 
            m.conversation_id = ?
      `;

    const params = [currentUserId, conversationId];

    // 2. Thêm điều kiện phân trang (nếu có beforeId)
    if (beforeId && beforeId != "undefined") {
      query += ` AND m.id < ?`; // Chỉ lấy tin nhắn CŨ hơn ID này
      params.push(beforeId);
    }

    // 3. Sắp xếp và giới hạn kết quả
    query += `
        ORDER BY 
            m.sent_at DESC, m.id DESC
        LIMIT ?;
      `;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    // --- XỬ LÝ GOM NHÓM DỮ LIỆU ---
    const messagesMap = new Map();

    for (const row of rows) {
      const messageId = row.message_id;
      if (!messagesMap.has(messageId)) {
        // Nếu đây là lần đầu thấy messageId này, tạo object message gốc
        messagesMap.set(messageId, {
          id: row.message_id,
          conversation_id: row.conversation_id,
          sender_id: row.sender_id,
          content: row.content,
          type: row.message_type,
          sent_at: row.sent_at,
          status: row.message_status,
          media: [],
        });
      }

      // Thêm media vào mảng nếu có dữ liệu media_id
      if (row.media_id) {
        messagesMap.get(messageId).media.push({
          id: row.media_id,
          media_url: row.media_url,
          media_file_type: row.media_file_type,
        });
      }
    }

    // Chuyển Map thành Array và đảo ngược thứ tự (mới -> cũ thành cũ -> mới)
    const formattedMessages = Array.from(messagesMap.values()).reverse();

    return formattedMessages;
  },

  

};

export default ConversationModel;

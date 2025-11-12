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
            message_statuses ms ON m.id = ms.message_id AND ms.receiver_id = ?
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
    const [conversation] = await pool.query(
      `SELECT user_id_1, user_id_2 FROM conversations WHERE id = ?`,
      [conversationId]
    );

    if (!conversation.length) return [];

    const { user_id_1, user_id_2 } = conversation[0];
    const partnerId = currentUserId === user_id_1 ? user_id_2 : user_id_1;

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
        CASE 
            WHEN m.sender_id = ? THEN COALESCE(ms2.status, 'sent')
            ELSE COALESCE(ms.status, 'sent')
        END AS message_status
    FROM 
        messages m
    LEFT JOIN 
        message_media mm ON m.id = mm.message_id
    LEFT JOIN
        message_statuses ms ON m.id = ms.message_id AND ms.receiver_id = ?
    LEFT JOIN
        message_statuses ms2 ON m.id = ms2.message_id AND ms2.receiver_id = ?
    WHERE 
        m.conversation_id = ?
  `;

    const params = [currentUserId, currentUserId, partnerId, conversationId];

    if (beforeId && beforeId != "undefined") {
      query += ` AND m.id < ?`;
      params.push(beforeId);
    }

    query += `
    ORDER BY m.sent_at DESC, m.id DESC
    LIMIT ?;
  `;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    // --- Gom nhóm dữ liệu như trước ---
    const messagesMap = new Map();
    for (const row of rows) {
      if (!messagesMap.has(row.message_id)) {
        messagesMap.set(row.message_id, {
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
      if (row.media_id) {
        messagesMap.get(row.message_id).media.push({
          id: row.media_id,
          media_url: row.media_url,
          media_file_type: row.media_file_type,
        });
      }
    }

    return Array.from(messagesMap.values()).reverse();
  },
};

export default ConversationModel;

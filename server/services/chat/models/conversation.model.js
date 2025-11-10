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
            m.type,
            m.sent_at,
            ms.status,
            -- Thêm cột đếm số lượng media
            (
                SELECT COUNT(mm_sub.id)
                FROM message_media mm_sub
                WHERE mm_sub.message_id = m.id
            ) AS media_count
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
};

export default ConversationModel
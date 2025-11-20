import { pool } from "../database/connectDB.js";

const NotificationModel = {
  addNotification: async (data) => {
    const {
      recipient_id,
      sender_id = null,
      type,
      entity_type,
      entity_id,
      content = null,
    } = data;

    const sql = `
      INSERT INTO notifications 
        (recipient_id, sender_id, type, entity_type, entity_id, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      recipient_id,
      sender_id,
      type,
      entity_type,
      entity_id,
      content,
    ];

    try {
      const [result] = await pool.execute(sql, params);
      return result.insertId; // trả về ID của notification vừa thêm
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  },

  getNotificationByRecipientId: async (recipient_id) => {
    try {
      const query = `
       SELECT *
        FROM notifications
        WHERE recipient_id = ?
        ORDER BY created_at DESC;
      `;

      const [rows] = await pool.query(query, [recipient_id]);

      return rows;
    } catch (error) {
      throw error;
    }
  },

  updateReadNotification: async (recipient_id) => {
    try {
      const query = `
        UPDATE notifications
        SET is_read = 1
        WHERE recipient_id = ?
      `;

      await pool.execute(query, [recipient_id]);
    } catch (error) {
      throw error;
    }
  },

  removeNotification: async (id) => {
    try {
      const query = `
        DELETE FROM notifications
        WHERE id = ?
      `;

      await pool.execute(query, [id]);
    } catch (error) {
      throw error;
    }
  },
};

export default NotificationModel;

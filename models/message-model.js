const pool = require("../database/")

// Store a new message
async function sendMessage(sender_id, recipient_id, message_text) {
  const sql = `
    INSERT INTO messages (sender_id, recipient_id, message_text)
    VALUES ($1, $2, $3)
  `
  return pool.query(sql, [sender_id, recipient_id, message_text])
}


// Retrieve all messages between two users
async function getMessagesBetween(sender_id, recipient_id) {
  const sql = `
    SELECT 
      m.message_text,
      m.sent_at,
      a.account_firstname || ' ' || a.account_lastname AS sender_name
    FROM messages m
    JOIN account a ON m.sender_id = a.account_id
    WHERE 
      (m.sender_id = $1 AND m.recipient_id = $2)
      OR
      (m.sender_id = $2 AND m.recipient_id = $1)
    ORDER BY m.sent_at ASC
  `
  const result = await pool.query(sql, [sender_id, recipient_id])
  return result.rows
}

// Mark all messages to the current user as read
async function markMessagesAsRead(account_id) {
  const sql = `
    UPDATE messages
    SET "read" = true
    WHERE recipient_id = $1 AND "read" = false
  `;
  const result = await pool.query(sql, [account_id]);
  return result.rowCount;
}

// Fetch all users except the currently logged-in user
async function getAllUsersExceptCurrent(currentUserId) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname
    FROM account
    WHERE account_id != $1
    ORDER BY account_firstname
  `
  const result = await pool.query(sql, [currentUserId])
  return result.rows
}

async function getUnreadCount(account_id) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM messages
       WHERE recipient_id = $1 AND "read" = false`,
      [account_id]
    );
    return parseInt(result.rows[0].count, 10);
  } catch (err) {
    console.error("Error fetching unread message count:", err);
    throw err;
  }
}

module.exports = {
  sendMessage,
  getMessagesBetween,
  markMessagesAsRead,
  getAllUsersExceptCurrent,
  getUnreadCount
}
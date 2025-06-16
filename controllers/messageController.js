const messageModel = require("../models/message-model")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

// Get all users except the current one
async function getAllUsers(req, res) {
  try {
    const account_id = res.locals.accountData.account_id
    const users = await messageModel.getAllUsersExceptCurrent(account_id)
    res.json({ success: true, users })
    console.log("getAllUsers hit")
  } catch (err) {
    console.error("Error fetching users:", err)
    res.status(500).json({ success: false, message: "Failed to fetch users" })
  }
}

// // Get unread message count for badge
// async function getUnreadCount(req, res) {
//   try {
//     const accountId = res.locals.accountData.account_id;
//     const count = await messageModel.getUnreadCount(accountId);
//     res.status(200).json({ success: true, unreadCount: count });
//   } catch (error) {
//     console.error("Error getting unread count:", error);
//     res.status(500).json({ success: false, unreadCount: 0 });
//   }
// }


// Show notification badge info (same as above, redundant?)
async function showMessageUI(req, res) {
  const nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  try {
    const unreadCount = await messageModel.getUnreadCount(account_id)
    res.status(200).json({ success: true, unreadCount })
  } catch (error) {
    console.error("Error showing message UI:", error)
    res.status(500).json({ success: false, message: "Failed to load message UI" })
  }
}

// Fetch messages between sender and recipient
async function fetchMessages(req, res) {
  const { recipient_id } = req.body
  const sender_id = res.locals.accountData.account_id
  try {
    const messages = await messageModel.getMessagesBetween(sender_id, recipient_id)
    res.json({ success: true, messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ success: false, message: "Failed to fetch messages" })
  }
}

// Send a new message
async function sendMessage(req, res) {
  const sender_id = res.locals.accountData.account_id
  const { recipient_id, message_text } = req.body
  try {
    await messageModel.sendMessage(sender_id, recipient_id, message_text)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ success: false, message: "Failed to send message" })
  }
}

// Mark all messages as read for the logged-in user
async function markAsRead(req, res) {
  const account_id = res.locals.accountData.account_id
  try {
    await messageModel.markMessagesAsRead(account_id)
    res.status(200).json({ success: true })
  } catch (err) {
    console.error("Error marking messages as read:", err)
    res.status(500).json({ success: false })
  }
}

module.exports = {
  showMessageUI,
  fetchMessages,
  sendMessage,
  getAllUsers,
  markAsRead,
  // getUnreadCount
}
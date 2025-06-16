const express = require("express")
const router = express.Router()
const messageController = require("../controllers/messageController")
const utilities = require("../utilities")

// Middleware to ensure user is authenticated
router.use(utilities.checkJWTTokenJSON)

// Get all users except current
router.get("/users", utilities.handleErrors(messageController.getAllUsers))

// Get unread message count for badge
// router.get("/unread-count", messageController.getUnreadCount)

// Message operations
router.post("/messages", utilities.handleErrors(messageController.fetchMessages))
router.post("/send", utilities.handleErrors(messageController.sendMessage))
router.post("/mark-read", utilities.handleErrors(messageController.markAsRead))

module.exports = router
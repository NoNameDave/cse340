// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/", utilities.handleErrors(invController.buildManagement))
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post("/add-classification", utilities.handleErrors(invController.addClassification))
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post("/add-inventory", utilities.handleErrors(invController.addInventory))

module.exports = router;
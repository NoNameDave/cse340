// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get(
  "/", 
  utilities.checkJWTToken,         // Verifies JWT and sets res.locals
  utilities.checkAccountType,      // Ensures Admin or Employee
  utilities.handleErrors(invController.buildManagement)
)
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView))
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post("/add-classification", utilities.handleErrors(invController.addClassification))
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post("/add-inventory", utilities.handleErrors(invController.addInventory))
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
// Route to build the edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))
router.post("/update/", invController.updateInventory)
router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
)

module.exports = router;
// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post("/register", utilities.handleErrors(accountController.registerAccount))

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildManagement)
)

router.get("/update/:account_id", utilities.checkLogin, accountController.buildUpdateView);
router.post("/update", regValidate.updateAccountRules(), accountController.updateAccount);
router.post("/update-password", regValidate.updatePasswordRules(), accountController.updatePassword);
router.get("/logout", accountController.logout);

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))
module.exports = router
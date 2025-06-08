const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    console.log("Entered Password:", account_password)
    console.log("Stored Hash:", accountData.account_password)

    const match = await bcrypt.compare(account_password, accountData.account_password)
    console.log("Match result:", match)

    if (match) {
      delete accountData.account_password

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600, // seconds, not ms
      })

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600000, // 1 hour in ms
      }

      if (process.env.NODE_ENV !== 'development') {
        cookieOptions.secure = true
      }

      res.cookie("jwt", accessToken, cookieOptions)
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData: res.locals.accountData,
    message: req.flash("notice"),
    errors: null
  })
}

async function buildUpdateView(req, res) {
  const account_id = parseInt(req.params.account_id);
  const data = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();
  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    ...data
  });
};

async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (updateResult) {
    req.flash("notice", "Account successfully updated.");
    return res.redirect(`/account/update/${account_id}`);
  } else {
    const nav = await utilities.getNav();
    req.flash("notice", "Account update failed.");
    return res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    });
  }
}

async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect(`/account/update/${account_id}`);
    } else {
      throw new Error("Password update failed");
    }
  } catch (error) {
    const nav = await utilities.getNav();
    req.flash("notice", "Password update failed.");
    return res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id
    });
  }
}

/* ****************************************
*  Process Logout
* *************************************** */
async function logout(req, res) {
  res.clearCookie("jwt"); // Delete the JWT cookie
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/"); // Redirect to home page
};

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdateView, updateAccount, updatePassword, logout }
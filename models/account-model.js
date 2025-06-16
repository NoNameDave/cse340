const pool = require('../database/')

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT * FROM account WHERE account_id = $1',
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error: " + error);
  }
}

async function updateAccount(account_id, first_name, last_name, email) {
  try {
    const sql = `UPDATE account
                 SET account_firstname = $1, account_lastname = $2, account_email = $3
                 WHERE account_id = $4
                 RETURNING *`;
    const data = await pool.query(sql, [first_name, last_name, email, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("updateAccount error: " + error);
  }
}

async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `UPDATE account
                 SET account_password = $1
                 WHERE account_id = $2`;
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rowCount;
  } catch (error) {
    console.error("updatePassword error: " + error);
  }
}

async function getAllAccounts() {
  try {
    const data = await pool.query("SELECT account_id, account_firstname, account_lastname FROM account")
    return data.rows
  } catch (error) {
    console.error("Database error fetching accounts", error)
    throw error
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, getAllAccounts }
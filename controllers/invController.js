const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildDetailView = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id)
  const data = await invModel.getVehicleById(inv_id)

  if (!data) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inv")
  }

  const nav = await utilities.getNav()
  res.render("inventory/detail", {
    title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
    nav,
    vehicle: data
  })
}

invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    message: req.flash("notice")
  })
}

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  let nav = await utilities.getNav()

  const regResult = await invModel.addClassification(classification_name)

  if (regResult) {
    req.flash("notice", `Successfully added ${classification_name}`)
    nav = await utilities.getNav() // rebuild nav to reflect new classification
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      message: req.flash("notice")
    })
  } else {
    req.flash("notice", "Failed to add classification.")
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: req.flash("notice"),
      errors: {
        array: () => [{ msg: "Database insert failed." }]
      },
      classification_name
    })
  }
}

invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

invCont.addInventory = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  const result = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  )

  if (result) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully added.`)
    res.redirect("/inv")
  } else {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Sorry, the inventory entry failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
  }
}

module.exports = invCont
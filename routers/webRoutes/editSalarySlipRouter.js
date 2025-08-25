const {Router}= require("express")
const { getEditSalarySlipPage } = require("../../controllers/webControllers/editSalarySlipController")
const router = Router()

router.get("/:id", getEditSalarySlipPage)

module.exports = router
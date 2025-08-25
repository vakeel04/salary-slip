const {Router} = require("express")
const router  = Router();
const { getHomePage } = require('../../controllers/webControllers/homeController')

router.get("/", getHomePage)

module.exports = router
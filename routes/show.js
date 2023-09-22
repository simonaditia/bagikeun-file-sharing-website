const express = require("express")
const showController = require("../controllers/showController")
const router = express.Router()


router.get("/:uuid", showController)

module.exports = router
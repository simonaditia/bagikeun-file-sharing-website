const express = require("express")
const fileController = require("../controllers/fileController")
const router = express.Router()

// router.post("")
router.post("/", fileController)

module.exports = router
const express = require("express")
const fileController = require("../controllers/fileController")
const router = express.Router()

router.post("/", fileController.uploadFile)
router.post("/send", fileController.sendEmail)

module.exports = router
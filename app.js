require('dotenv').config()
const express = require("express")
const app = express()
const PORT = 3001

const connectDB = require("./config/db")
connectDB()

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
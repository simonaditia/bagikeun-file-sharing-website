require('dotenv').config()
const express = require("express")
const filesRoute = require("./routes/files")
const showRoute = require("./routes/show")
const downloadRoute = require("./routes/download")
const app = express()
const path = require("path")
const PORT = 3001

const connectDB = require("./config/db")
connectDB()

app.use(express.static("public"))
app.use(express.json())

app.set("views", path.join(__dirname, "/views"))
app.set("view engine", "ejs")

app.use("/api/files", filesRoute)
app.use("/files", showRoute)
app.use("/files/download", downloadRoute)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
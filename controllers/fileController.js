const multer = require("multer")
const File = require("../models/file")
const admin = require("firebase-admin");

const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    storageBucket: process.env.STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

const {
    v4: uuid4
} = require("uuid")

let storage = multer.memoryStorage();

/*let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})*/

let upload = multer({
    storage: storage,
    limit: {
        fileSize: 100000 * 100
    }
}).single("myfile")

const uploadFile = (req, res) => {
    // Store File
    upload(req, res, async (err) => {
        // Validate Request
        console.log(req.file);
        if (!req.file) {
            return res.status(400).json({
                error: "All fields are required."
            })
        }

        if (err) {
            return res.status(500).send({
                error: err.message
            })
        }

        // Store file into Firebase Database
        const blob = bucket.file(req.file.originalname)
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimeType
            }
        })

        blobStream.on("error", (err) => {
            return res.status(500).send({
                error: err.message
            })
        })

        blobStream.on("finish", async () => {
            const file = new File({
                filename: req.file.originalname,
                uuid: uuid4(),
                size: req.file.size,
                url: ""
            })

            const [url] = await blob.getSignedUrl({
                action: "read",
                expires: "01-01-2100"
            })

            file.url = url
            const response = await file.save()

            return res.json({
                fileUrl: url,
                fileUuid: response.uuid
            })
        })
        blobStream.end(req.file.buffer)
    })
    // Response -> Link
}

const sendEmail = async (req, res) => {
    const {
        uuid,
        emailTo,
        emailFrom
    } = req.body

    // Validate request
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({
            error: "All fields are required."
        })
    }

    // Get data from database
    const file = await File.findOne({
        uuid: uuid
    })
    if (file.sender) {
        return res.status(422).send({
            error: "Email already send."
        })
    }

    file.sender = emailFrom
    file.receiver = emailTo
    const response = await file.save()

    // Send email
    const sendMail = require("../services/emailService")
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: "Bagikeun file sharing",
        text: `${emailFrom} shared a file with you.`,
        html: require("../services/emailTemplate")({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size / 1000) + " KB",
            expires: "24 hours"
        })
    })
    return res.send({
        success: true
    })
}

module.exports = {
    uploadFile,
    sendEmail
}
const File = require("../models/file")
const showController = async (req, res) => {
    try {
        const file = await File.findOne({
            uuid: req.params.uuid
        })
        if (!file) {
            return res.render("download", {
                error: "Link has been expired."
            })
        }
        return res.render("download", {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: file.url
            // downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        })
    } catch (error) {
        return res.render("download", {
            error: "Something went wrong."
        })
    }
}
module.exports = showController
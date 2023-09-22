const File = require("../models/file")

const downloadController = async (req, res) => {
    const file = await File.findOne({
        uuid: req.params.uuid
    })

    if (!file) {
        return res.render("download", {
            error: "Link has been expired."
        })
    }

    const filePath = `${__dirname}/../${file.path}`
    res.download(filePath)
}
module.exports = downloadController
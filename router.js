const { default: mongoose } = require("mongoose");
const multer = require("multer");
const router = require("express").Router()
const { GridFsStorage } = require("multer-gridfs-storage")
const path = require("path")
const crypto = require("crypto")
const Grid = require("gridfs-stream")

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './upload');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + file.originalname)
//     }
// })
let conn;
let gfs;
const URI = process.env.URL
const promise = mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
conn = mongoose.connection

conn.once('open', (err) => {
    if (err) {
        throw Error(err)
    }
    gfs = Grid(conn, mongoose.mongo);
    gfs.collection('uploads');
});


const storage = new GridFsStorage({
    db: promise,
    file: (req, file) => {
        console.log({ file })
        const changeFileName = file
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: 12345,
                    name: "Sanju",
                    Id: "1234582",
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
})

const upload = multer(
    { storage: storage })

router.get("/", async (req, res) => {
    return res.status(200).json({ message: "This is Home Page user" })
})

router.post("/upload", upload.single("file"), (req, res) => {
    console.log(req.file)
    return res.status(200).json({ message: "image uploaded" })
})


router.get("/all", async (req, res) => {
    try {
        const files = await gfs.files.find().toArray();
        return res.status(200).json({ files })

    }
    catch (err) {
        return res.status(200).json({ message: "error" })
    }
})

router.get("/image/:filename", async (req, res) => {
    try {

        console.log(req.params.filename)
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            console.log("fine", file)
            if (!file || file.length === 0) {
                return res.status(404).json({ err: 'No File Exists' });
            } else {
                // Check if is image
                if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
                    // Read output to broswer
                    const readstream = gfs.createReadStream(file.filename);
                    readstream.pipe(res);
                } else {
                    res.status(404).json({ err: 'Not and image' });
                }
            }
        });
    }
    catch (err) {
        return res.status(200).json({ message: "error" })
    }
})

module.exports = router;
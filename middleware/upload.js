const multer = require("multer");
 const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "middleware/image");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("photo");
module.exports = upload
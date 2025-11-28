const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const { width, height } = { width: 500, height: 500 };

    return {
      folder: "uploads",
      allowedFormats: ["jpeg", "png", "jpg", "heic", "webp"],
      transformation: [{ width, height, crop: "limit" }],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;

// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

// const upload = multer({ storage });

// module.exports = upload;

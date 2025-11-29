import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/temp");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname + "-" + Date.now());
  },
});

export const upload = multer({ storage });

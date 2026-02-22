import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // to allow videos
  if (file.fieldname === "video" && file.mimetype.startsWith("video/")) {
    cb(null, true);
  }
  // to allow images (thumbnails - both for courses and lessons)
  else if (
    file.fieldname === "thumbnail" &&
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  }
  // to allow PDFs
  else if (file.fieldname === "pdf" && file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

export default upload;

const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("csvFile"), imageController.uploadCsv);
router.get("/status/:requestId", imageController.checkStatus);

module.exports = router;

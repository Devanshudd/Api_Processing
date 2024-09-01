const fs = require("fs");
const multer = require("multer");
const csv = require("csv-parser");
const Image = require("../models/imageModel");
const queue = require("../config/queue");
const { v4: uuidv4 } = require("uuid");

// Multer setup for file upload
const upload = multer({ dest: "uploads/" });

exports.uploadCsv = (req, res) => {
  const requestId = uuidv4();
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      for (const row of results) {
        const {
          "Serial Number": serialNumber,
          "Product Name": productName,
          "Input Image Urls": urls,
        } = row;

        // Split URLs and trim to remove any extra spaces or newlines
        const inputUrls = urls
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url);

        // Save to database
        await new Image({
          serialNumber,
          productName,
          inputUrls,
          requestId,
        }).save();

        // Add to processing queue
        queue.add({ inputUrls, productName, requestId });
      }

      res.status(200).json({ requestId });
    });
};

exports.checkStatus = async (req, res) => {
  const { requestId } = req.params;
  const imageEntry = await Image.findOne({ requestId });
  if (!imageEntry) {
    return res.status(404).json({ message: "Request ID not found" });
  }
  res.status(200).json(imageEntry);
};

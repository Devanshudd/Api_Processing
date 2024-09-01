const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Image = require("../models/imageModel");

const processImages = async (job) => {
  const { inputUrls, productName, requestId, webhookUrl } = job.data;

  console.log(
    `Processing job for product: ${productName} with requestId: ${requestId}`
  );

  const outputUrls = [];
  const outputDir = path.join(__dirname, "../output");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    for (let i = 0; i < inputUrls.length; i++) {
      const inputUrl = inputUrls[i].trim();
      const outputPath = path.join(
        outputDir,
        `${productName}-${requestId}-compressed-${i}.jpg`
      );

      console.log(`Processing image ${inputUrl} for product: ${productName}`);
      console.log(`Saving to ${outputPath}`);

      try {
        // Download image
        const response = await axios({
          url: inputUrl,
          responseType: "arraybuffer",
        });
        const inputBuffer = Buffer.from(response.data);

        // Compress the image
        await sharp(inputBuffer).jpeg({ quality: 50 }).toFile(outputPath);

        // Add the output URL to the list
        outputUrls.push(
          `http://localhost:3000/output/${productName}-${requestId}-compressed-${i}.jpg`
        );
      } catch (err) {
        console.error(
          `Failed to process ${inputUrl} for product ${productName}:`,
          err.message
        );
        outputUrls.push(`Failed to process ${inputUrl}`);
      }
    }

    // Log the output URLs for debugging
    console.log(`Output URLs for product ${productName}:`, outputUrls);

    // Update database with output URLs and mark as completed
    const result = await Image.findOneAndUpdate(
      { requestId },
      { outputUrls, status: "completed" },
      { new: true, runValidators: true }
    );

    if (!result) {
      console.error(`No document found with requestId: ${requestId}`);
    } else {
      console.log(`Database updated successfully for requestId: ${requestId}`);

      // Send webhook notification after processing is complete
      if (webhookUrl) {
        try {
          await axios.post(webhookUrl, {
            requestId,
            outputUrls,
          });
          console.log(`Webhook sent for requestId: ${requestId}`);
        } catch (error) {
          console.error(
            `Failed to send webhook for requestId: ${requestId}`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error(`Error processing images for product ${productName}:`, error);
    await Image.findOneAndUpdate({ requestId }, { status: "failed" });

    // Notify failure via webhook if needed
    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, {
          requestId,
          outputUrls: [], // Send an empty array or a failure message
          status: "failed",
        });
        console.log(`Failure webhook sent for requestId: ${requestId}`);
      } catch (error) {
        console.error(
          `Failed to send failure webhook for requestId: ${requestId}`,
          error.message
        );
      }
    }
  }
};

module.exports = processImages;

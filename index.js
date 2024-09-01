require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const imageRoutes = require("./routes/imageRoutes");
const redisClient = require("./config/redis");
const queue = require("./config/queue");
const bodyParser = require("body-parser");
const Image = require("./models/imageModel"); // Correct import for Image model

const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Use the router for API routes
app.use("/api/images", imageRoutes);

// Webhook Endpoint
app.post("/webhook", async (req, res) => {
  const { requestId, outputUrls } = req.body;

  console.log("Received webhook request:");
  console.log("Request ID:", requestId);
  console.log("Output URLs:", outputUrls);

  try {
    // Find the image processing request by requestId
    const image = await Image.findOne({ requestId });

    if (!image) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Update the image document with output URLs and mark it as completed
    image.outputUrls = outputUrls;
    image.status = "completed";
    image.updatedAt = new Date();

    await image.save();

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

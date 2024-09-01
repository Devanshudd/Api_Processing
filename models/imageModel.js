const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    serialNumber: Number,
    productName: String,
    inputUrls: [String],
    outputUrls: [String],
    status: {
      type: String,
      enum: ["pending", "processing", "completed"],
      default: "pending",
    },
    requestId: String,
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;

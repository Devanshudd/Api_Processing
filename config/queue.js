const Queue = require("bull");
const redisClient = require("./redis");
const processImages = require("../jobs/imageJob");

const imageQueue = new Queue("imageQueue", {
  redis: {
    host: redisClient.options.host,
    port: redisClient.options.port,
  },
});

// Process jobs from the queue
imageQueue.process(async (job) => {
  console.log("Processing job with data:", job.data);

  try {
    // Pass the entire job object instead of just job.data
    await processImages(job); // Pass the whole job object
  } catch (error) {
    console.error("Error processing job:", error);
    throw error; // Re-throw to mark the job as failed
  }
});

// Optional: Add event listeners for job events
imageQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result: ${result}`);
});

imageQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err}`);
  // Optionally update job status in your database or retry
});

module.exports = imageQueue;

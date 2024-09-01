# Image Processing API

This project is designed to process image data from CSV files efficiently. It validates the CSV data, processes the images asynchronously by compressing them, and stores the processed data along with associated product information in a database.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [How to Test](#how-to-test)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Redis server (for job queue management)
- A database (SQL or NoSQL) configured as per the `db.js` file.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Devanshudd/Api_Processing.git
   cd Api_Processing
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set up the environment variables:**

```bash
   PORT=3000
   DB_URI=<your_database_connection_string>
   REDIS_URL=<your_redis_connection_string>
   MONGO_URI=mongodb://localhost:27017/<yourDatabaseName>
```

## Running the Application

### Start the Redis server:

Ensure Redis is running on your system. If installed locally, start it with:

```bash
redis-server --port <your-port>
```

Ensure mongoDB is installed and running in a seperate terminal.

```bash
sudo systemctl start mongod
```

Start index.js

```bash
node index.js
```

## API Endpoints

Upload API: Accepts CSV files, validates them, and returns a unique request ID.

```bash
POST api/images/upload
```

Status API: Allows users to query the processing status using the request ID.

```bash
GET api/images/status/:requestId
```

Webhook API: This endpoint handles callbacks from the image processing service once all
images have been processed

```bash
POST /webhook
```

## How to Test

- Use Postman for testing.
- A Postman collection is available in the repository for testing purposes.

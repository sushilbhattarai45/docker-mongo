const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongo:27017/demo";
const DB_NAME = "demo";
const COLLECTION = "items";

const app = express();
app.use(express.json());

let db;

async function connectDb() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("Connected to MongoDB");
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/items", async (_req, res) => {
  try {
    const items = await db.collection(COLLECTION).find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/items", async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const item = {
      name,
      description: description || "",
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(item);
    res.status(201).json({ _id: result.insertedId, ...item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  await connectDb();
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
    await client.connect();
    db = client.db();
    console.log("MongoDB connected");
}

function getDB() {
    return db;
}

module.exports = { connectDB, getDB };

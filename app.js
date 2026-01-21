const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("./database");
const path = require("path");
const {connectDB} = require("./database");

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, ".", "index.html"));
});

app.get("/api/products", async (req, res) => {
    const { category, minPrice, sort, fields } = req.query;

    const filter = {};
    if (category) {
        filter.category = category;
    }

    if (minPrice) {
        filter.price = { $gte: Number(minPrice) };
    }

    const options = {};
    if (fields) {
        options.projection = {};
        fields.split(",").forEach(f => options.projection[f] = 1);
    }

    let query = getDB().collection("products").find(filter, options);

    if (sort === "price") query = query.sort({ price: 1 });

    const products = await query.toArray();
    res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await getDB()
            .collection("products")
            .findOne({ _id: new ObjectId(req.params.id) });

        if (!product) {
            return res.status(404).json({ error: "product not found" });
        }

        res.status(200).json(product);
    } catch {
        res.status(400).json({ error: "Invalid id" });
    }
});

app.post("/api/products", async (req, res) => {
    const {name, price, category} = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        const result = await getDB()
            .collection("products")
            .insertOne({ name, price, category });

        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.use((req, res) => {
    if (req.url.startsWith("/api")) {
        res.status(404).json({ error: "Not found" });
    } else {
        res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
    }
});

connectDB().then(() => {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
});
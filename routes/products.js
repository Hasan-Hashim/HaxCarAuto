const express = require("express");
const router = express.Router();
const sqlite3 = require("better-sqlite3");

const db = new sqlite3("./ecommerce.db");

// GET all products with pagination and search
router.get("/", (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const products = db
            .prepare(`
                SELECT * FROM Products
                WHERE name LIKE ?
                LIMIT ? OFFSET ?
            `)
            .all(`%${search}%`, limit, offset);

        const total = db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM Products
                WHERE name LIKE ?
            `)
            .get(`%${search}%`).count;

        res.json({ products, total, page, limit });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    }
});

// GET a single product by ID
router.get("/:id", (req, res) => {
    try {
        const product = db.prepare("SELECT * FROM Products WHERE id = ?").get(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Error fetching product");
    }
});

module.exports = router;

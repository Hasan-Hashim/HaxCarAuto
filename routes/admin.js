const express = require("express");
const router = express.Router();
const multer = require("multer");
const sqlite3 = require("better-sqlite3");

const db = new sqlite3("./ecommerce.db");

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// GET all products for admin
router.get("/products", (req, res) => {
    try {
        const products = db.prepare("SELECT * FROM Products").all();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    }
});

// GET a single product for editing
router.get("/products/:id", (req, res) => {
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

// UPDATE a product
router.put("/products/:id", (req, res) => {
    const { name, description, price, image_url, category_id } = req.body;
    try {
        db.prepare(`
            UPDATE Products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?
            WHERE id = ?
        `).run(name, description, price, image_url, category_id, req.params.id);
        res.send("Product updated successfully");
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    }
});

// DELETE a product
router.delete("/products/:id", (req, res) => {
    try {
        db.prepare("DELETE FROM Products WHERE id = ?").run(req.params.id);
        res.send("Product deleted successfully");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Error deleting product");
    }
});

// POST bulk upload products from JSON
router.post("/upload", upload.single("file"), (req, res) => {
    const filePath = req.file.path;
    try {
        const data = require(`../${filePath}`);
        const insert = db.prepare(`
            INSERT INTO Products (name, description, price, image_url, category_id)
            VALUES (?, ?, ?, ?, ?)
        `);

        data.forEach((product) => {
            insert.run(product.name, product.description, product.price, product.image_url, product.category_id);
        });

        res.send("Products uploaded successfully");
    } catch (error) {
        console.error("Error processing bulk upload:", error);
        res.status(500).send("Error processing bulk upload");
    }
});

module.exports = router;

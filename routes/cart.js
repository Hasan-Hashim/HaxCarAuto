const express = require("express");
const router = express.Router();
const sqlite3 = require("better-sqlite3");

const db = new sqlite3("./ecommerce.db");

// GET all cart items
router.get("/", (req, res) => {
    try {
        const cartItems = db
            .prepare(`
                SELECT CartProducts.id, Products.name, Products.price, Products.image_url, CartProducts.quantity 
                FROM CartProducts 
                JOIN Products ON CartProducts.product_id = Products.id
            `)
            .all();

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        res.json({ items: cartItems, total });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).send("Error fetching cart items");
    }
});

// POST add an item to the cart
router.post("/add", (req, res) => {
    const { productId } = req.body;

    try {
        // Check if the product exists in the database
        const product = db.prepare("SELECT * FROM Products WHERE id = ?").get(productId);
        if (!product) {
            return res.status(400).send("Invalid product ID");
        }

        // Check if the product is already in the cart
        const existingItem = db.prepare("SELECT * FROM CartProducts WHERE product_id = ?").get(productId);

        if (existingItem) {
            // Update the quantity if the product is already in the cart
            db.prepare("UPDATE CartProducts SET quantity = quantity + 1 WHERE product_id = ?").run(productId);
        } else {
            // Insert the product into the cart
            db.prepare("INSERT INTO CartProducts (product_id, quantity) VALUES (?, 1)").run(productId);
        }

        res.send("Product added to cart");
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send("Failed to add product to cart");
    }
});

// PUT update cart item quantity
router.put("/update", (req, res) => {
    const { id, quantity } = req.body;

    try {
        if (quantity <= 0) {
            return res.status(400).send("Quantity must be greater than 0");
        }

        db.prepare("UPDATE CartProducts SET quantity = ? WHERE id = ?").run(quantity, id);

        res.send("Cart updated successfully");
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).send("Error updating cart");
    }
});

// DELETE remove an item from the cart
router.delete("/remove/:id", (req, res) => {
    try {
        db.prepare("DELETE FROM CartProducts WHERE id = ?").run(req.params.id);

        res.send("Item removed from cart");
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).send("Error removing item from cart");
    }
});

// DELETE clear all items in the cart (Optional)
router.delete("/clear", (req, res) => {
    try {
        db.prepare("DELETE FROM CartProducts").run();

        res.send("Cart cleared successfully");
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).send("Error clearing cart");
    }
});

module.exports = router;

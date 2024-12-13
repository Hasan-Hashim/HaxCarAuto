const express = require("express");
const router = express.Router();
const sqlite3 = require("better-sqlite3");

const db = new sqlite3("./ecommerce.db");

// POST sign-in
router.post("/sign-in", (req, res) => {
    const { email, password } = req.body;

    try {
        const user = db
            .prepare("SELECT id, name, email FROM Users WHERE email = ? AND password = ?")
            .get(email, password);

        if (user) {
            res.json(user); // Return user data on successful sign-in
        } else {
            res.status(401).send("Invalid email or password");
        }
    } catch (error) {
        console.error("Error signing in:", error);
        res.status(500).send("An error occurred during sign-in");
    }
});

module.exports = router;

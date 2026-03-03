const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (_req, res) => {
    db.query(
        "SELECT id, name, rating, feedback, created_at FROM feedback_messages ORDER BY id DESC LIMIT 50",
        (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database Error" });
            }

            return res.json(rows);
        }
    );
});

router.post("/", (req, res) => {
    const { name, email, rating, feedback } = req.body;
    const numericRating = Number(rating);

    if (!name || !email || !feedback || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: "Invalid feedback data" });
    }

    db.query(
        "INSERT INTO feedback_messages (name, email, rating, feedback) VALUES (?, ?, ?, ?)",
        [name, email, numericRating, feedback],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database Error" });
            }

            return res.json({ message: "Feedback saved successfully" });
        }
    );
});

module.exports = router;

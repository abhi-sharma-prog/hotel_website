const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (_req, res) => {
    db.query(
        "SELECT id, title, content, author, image_url, created_at FROM blog_posts ORDER BY id DESC LIMIT 100",
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
    const { title, content, author, imageUrl } = req.body;
    const safeAuthor = (author || "Guest").trim();
    const safeImageUrl = (imageUrl || "").trim() || null;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }

    db.query(
        "INSERT INTO blog_posts (title, content, author, image_url) VALUES (?, ?, ?, ?)",
        [title.trim(), content.trim(), safeAuthor, safeImageUrl],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database Error" });
            }

            return res.json({
                message: "Blog post saved successfully",
                postId: result.insertId
            });
        }
    );
});

module.exports = router;

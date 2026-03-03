const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {

    const { name, email, guest, message } = req.body;
    const guestCount = Number(guest);

    if (!name || !email || !message || !Number.isInteger(guestCount) || guestCount < 1) {
        return res.status(400).json({ error: "Invalid contact data" });
    }

    db.query(
        "INSERT INTO contact_messages (name, email, guest_count, message) VALUES (?, ?, ?, ?)",
        [name, email, guestCount, message],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database Error" });
            }

            res.json({ message: "Message Saved Successfully" });
        }
    );

});

module.exports = router;

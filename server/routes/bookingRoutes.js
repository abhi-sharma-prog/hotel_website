const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
    const { name, email, phone, date, time, people } = req.body;
    const peopleCount = Number(people);

    if (!name || !email || !phone || !date || !time || !Number.isInteger(peopleCount) || peopleCount < 1) {
        return res.status(400).json({ error: "Invalid booking data" });
    }

    db.query(
        "INSERT INTO bookings (name, email, phone, date, time, people) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, phone, date, time, peopleCount],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database Error" });
            }
            res.json({ message: "Booking Successful" });
        }
    );
});

module.exports = router;

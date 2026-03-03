const db = require("../config/db");

exports.createBill = (req, res) => {
    const { items, grandTotal } = req.body;

    db.query(
        "INSERT INTO bills (grandTotal) VALUES (?)",
        [grandTotal],
        (err, result) => {
            if (err) return res.status(500).json(err);

            const billId = result.insertId;

            const values = items.map(item => [
                billId,
                item.name,
                item.price,
                item.quantity,
                item.total
            ]);

            db.query(
                "INSERT INTO bill_items (bill_id, name, price, quantity, total) VALUES ?",
                [values],
                (err2) => {
                    if (err2) return res.status(500).json(err2);
                    res.json({ message: "Bill Saved Successfully" });
                }
            );
        }
    );
};

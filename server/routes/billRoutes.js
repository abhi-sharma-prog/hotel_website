const express = require("express");
const crypto = require("crypto");
const db = require("../config/db");

const router = express.Router();
const otpTtlMinutes = Number(process.env.BILL_OTP_TTL_MINUTES || 10);

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const getBillDetails = (billId, callback) => {
    db.query(
        "SELECT id, customer_name, customer_phone, payment_mode, payment_method, payment_status, payment_reference, grandTotal, createdAt FROM bills WHERE id = ?",
        [billId],
        (billErr, billRows) => {
            if (billErr) return callback(billErr);
            if (!billRows.length) return callback(null, null);

            db.query(
                "SELECT name, price, quantity, total FROM bill_items WHERE bill_id = ? ORDER BY id ASC",
                [billId],
                (itemErr, itemRows) => {
                    if (itemErr) return callback(itemErr);
                    return callback(null, { bill: billRows[0], items: itemRows });
                }
            );
        }
    );
};

router.post("/", (req, res) => {
    const {
        items,
        grandTotal,
        customerName,
        customerPhone,
        paymentMode,
        paymentMethod,
        paymentStatus,
        paymentReference
    } = req.body;

    if (!Array.isArray(items) || !items.length) {
        return res.status(400).json({ message: "No items selected" });
    }

    const safeName = String(customerName || "").trim();
    const safePhone = String(customerPhone || "").trim();
    const mode = String(paymentMode || "offline").toLowerCase();

    if (!safeName || !safePhone) {
        return res.status(400).json({ message: "Customer name and phone are required" });
    }

    if (!["offline", "online"].includes(mode)) {
        return res.status(400).json({ message: "Invalid payment mode" });
    }

    const normalizedItems = items
        .map((item) => ({
            name: item?.name,
            price: Number(item?.price),
            quantity: Number(item?.quantity),
            total: Number(item?.total)
        }))
        .filter((item) => item.name && item.price > 0 && item.quantity > 0 && item.total >= 0);

    if (!normalizedItems.length) {
        return res.status(400).json({ message: "Invalid bill items" });
    }

    const computedTotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
    const finalTotal = Number(grandTotal) || computedTotal;

    db.beginTransaction((txErr) => {
        if (txErr) {
            console.error(txErr);
            return res.status(500).json({ message: "Database error" });
        }

        db.query(
            "INSERT INTO bills (customer_name, customer_phone, customer_contact, payment_mode, payment_method, payment_status, payment_reference, grandTotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                safeName,
                safePhone,
                safePhone,
                mode,
                paymentMethod ? String(paymentMethod).trim() : null,
                paymentStatus ? String(paymentStatus).trim() : (mode === "online" ? "paid" : "pending"),
                paymentReference ? String(paymentReference).trim() : null,
                finalTotal
            ],
            (billErr, billResult) => {
                if (billErr) {
                    return db.rollback(() => {
                        console.error(billErr);
                        res.status(500).json({ message: "Database error" });
                    });
                }

                const billId = billResult.insertId;
                const valuesWithBillId = normalizedItems.map((item) => [
                    billId,
                    item.name,
                    item.price,
                    item.quantity,
                    item.total
                ]);

                db.query(
                    "INSERT INTO bill_items (bill_id, name, price, quantity, total) VALUES ?",
                    [valuesWithBillId],
                    (itemErr) => {
                        if (itemErr) {
                            return db.rollback(() => {
                                console.error(itemErr);
                                res.status(500).json({ message: "Database error" });
                            });
                        }

                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    console.error(commitErr);
                                    res.status(500).json({ message: "Database error" });
                                });
                            }

                            return res.json({ message: "Bill saved successfully", billId });
                        });
                    }
                );
            }
        );
    });
});

router.post("/request-otp", (req, res) => {
    const safeContact = String(req.body.contact || "").trim();
    if (!safeContact) {
        return res.status(400).json({ error: "contact is required" });
    }

    db.query(
        "SELECT id FROM bills WHERE customer_phone = ? ORDER BY id DESC LIMIT 1",
        [safeContact],
        (lookupErr, rows) => {
            if (lookupErr) {
                console.error(lookupErr);
                return res.status(500).json({ error: "Database Error" });
            }

            if (!rows.length) {
                return res.status(404).json({ error: "No bill found for this contact" });
            }

            const billId = Number(rows[0].id);
            const otpCode = String(crypto.randomInt(100000, 999999));

            db.query(
                "INSERT INTO bill_otp_requests (bill_id, contact, otp_code, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))",
                [billId, safeContact, otpCode, otpTtlMinutes],
                (otpErr) => {
                    if (otpErr) {
                        console.error(otpErr);
                        return res.status(500).json({ error: "Database Error" });
                    }

                    return res.json({
                        message: "OTP generated. SMS gateway is not configured, so use mobile last-4 verification to download."
                    });
                }
            );
        }
    );
});

router.post("/verify-otp", (req, res) => {
    const safeContact = String(req.body.contact || "").trim();
    const otpCode = String(req.body.otp || "").trim();

    if (!safeContact || !otpCode) {
        return res.status(400).json({ error: "contact and otp are required" });
    }

    db.query(
        "SELECT id, bill_id FROM bill_otp_requests WHERE contact = ? AND otp_code = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
        [safeContact, otpCode],
        (otpErr, otpRows) => {
            if (otpErr) {
                console.error(otpErr);
                return res.status(500).json({ error: "Database Error" });
            }

            if (!otpRows.length) {
                return res.status(400).json({ error: "Invalid or expired OTP" });
            }

            const otpRowId = otpRows[0].id;
            const billId = Number(otpRows[0].bill_id);

            db.query("UPDATE bill_otp_requests SET is_used = 1 WHERE id = ?", [otpRowId], (updateErr) => {
                if (updateErr) {
                    console.error(updateErr);
                    return res.status(500).json({ error: "Database Error" });
                }

                getBillDetails(billId, (fetchErr, details) => {
                    if (fetchErr) {
                        console.error(fetchErr);
                        return res.status(500).json({ error: "Database Error" });
                    }

                    if (!details) {
                        return res.status(404).json({ error: "Bill not found" });
                    }

                    return res.json({ message: "OTP verified", ...details });
                });
            });
        }
    );
});

router.post("/search", (req, res) => {
    const contact = String(req.body.contact || "").trim();
    const billId = req.body.billId !== undefined && req.body.billId !== null && req.body.billId !== ""
        ? Number(req.body.billId)
        : null;

    if (!contact && billId === null) {
        return res.status(400).json({ error: "Enter phone number or bill id to search" });
    }

    if (billId !== null && (!Number.isInteger(billId) || billId < 1)) {
        return res.status(400).json({ error: "Invalid bill id" });
    }

    const whereParts = [];
    const params = [];

    if (contact) {
        whereParts.push("customer_phone = ?");
        params.push(contact);
    }
    if (billId !== null) {
        whereParts.push("id = ?");
        params.push(billId);
    }

    const sql = `SELECT id, grandTotal, createdAt FROM bills WHERE ${whereParts.join(" AND ")} ORDER BY id DESC LIMIT 30`;

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database Error" });
        }

        return res.json(rows || []);
    });
});

router.post("/verify-download", (req, res) => {
    const contact = String(req.body.contact || "").trim();
    const lastFour = onlyDigits(req.body.lastFour).slice(-4);
    const billId = req.body.billId !== undefined && req.body.billId !== null && req.body.billId !== ""
        ? Number(req.body.billId)
        : null;

    if (!contact || lastFour.length !== 4) {
        return res.status(400).json({ error: "Phone and last 4 digits are required" });
    }

    if (billId !== null && (!Number.isInteger(billId) || billId < 1)) {
        return res.status(400).json({ error: "Invalid bill id" });
    }

    const sql = billId === null
        ? "SELECT id, customer_phone FROM bills WHERE customer_phone = ? ORDER BY id DESC LIMIT 1"
        : "SELECT id, customer_phone FROM bills WHERE id = ? AND customer_phone = ? LIMIT 1";
    const params = billId === null ? [contact] : [billId, contact];

    db.query(sql, params, (lookupErr, rows) => {
        if (lookupErr) {
            console.error(lookupErr);
            return res.status(500).json({ error: "Database Error" });
        }

        if (!rows.length) {
            return res.status(404).json({ error: "Bill not found" });
        }

        const safePhone = onlyDigits(rows[0].customer_phone);
        if (safePhone.length < 4 || safePhone.slice(-4) !== lastFour) {
            return res.status(403).json({ error: "Verification failed. Last 4 digits did not match." });
        }

        return getBillDetails(Number(rows[0].id), (fetchErr, details) => {
            if (fetchErr) {
                console.error(fetchErr);
                return res.status(500).json({ error: "Database Error" });
            }
            if (!details) {
                return res.status(404).json({ error: "Bill not found" });
            }
            return res.json({ message: "Verified", ...details });
        });
    });
});

router.get("/latest", (_req, res) => {
    db.query(
        "SELECT id, customer_name, customer_phone, payment_mode, payment_method, payment_status, grandTotal, createdAt FROM bills ORDER BY id DESC LIMIT 10",
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database Error" });
            }

            return res.json(rows);
        }
    );
});

router.get("/:id", (req, res) => {
    const billId = Number(req.params.id);
    if (!Number.isInteger(billId) || billId < 1) {
        return res.status(400).json({ error: "Invalid bill id" });
    }

    getBillDetails(billId, (err, details) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database Error" });
        }
        if (!details) {
            return res.status(404).json({ error: "Bill not found" });
        }
        return res.json(details);
    });
});

module.exports = router;

const express = require("express");
const Stripe = require("stripe");
const db = require("../config/db");

const router = express.Router();

const getStripeClient = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        return null;
    }

    return new Stripe(secretKey);
};

router.post("/checkout-session", async (req, res) => {
    const stripe = getStripeClient();
    if (!stripe) {
        return res.status(500).json({ error: "Payment is not configured on server" });
    }

    const { name, email, phone, date, time, people } = req.body;
    const peopleCount = Number(people);
    const depositPerPersonPaise = Number(process.env.BOOKING_DEPOSIT_PER_PERSON_PAISE || 20000);
    const clientBaseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5000";

    if (!name || !email || !phone || !date || !time || !Number.isInteger(peopleCount) || peopleCount < 1) {
        return res.status(400).json({ error: "Invalid booking data for payment" });
    }

    if (!Number.isInteger(depositPerPersonPaise) || depositPerPersonPaise <= 0) {
        return res.status(500).json({ error: "Invalid payment configuration" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        unit_amount: depositPerPersonPaise,
                        product_data: {
                            name: "Restaurant Table Booking Deposit",
                            description: `Booking for ${peopleCount} guest(s) on ${date} at ${time}`
                        }
                    },
                    quantity: peopleCount
                }
            ],
            metadata: {
                name,
                email,
                phone,
                date,
                time,
                people: String(peopleCount)
            },
            success_url: `${clientBaseUrl}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientBaseUrl}/payment-cancel.html`
        });

        return res.json({
            message: "Checkout session created",
            url: session.url,
            sessionId: session.id
        });
    } catch (err) {
        console.error("Stripe checkout session error:", err);
        return res.status(500).json({ error: "Unable to create payment session" });
    }
});

router.post("/confirm", async (req, res) => {
    const stripe = getStripeClient();
    if (!stripe) {
        return res.status(500).json({ error: "Payment is not configured on server" });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return res.status(400).json({ error: "Payment is not completed" });
        }

        db.query(
            "SELECT booking_id FROM payment_transactions WHERE session_id = ?",
            [sessionId],
            (checkErr, existingRows) => {
                if (checkErr) {
                    console.error(checkErr);
                    return res.status(500).json({ error: "Database Error" });
                }

                if (existingRows.length > 0) {
                    return res.json({
                        message: "Payment already confirmed",
                        bookingId: existingRows[0].booking_id
                    });
                }

                const metadata = session.metadata || {};
                const peopleCount = Number(metadata.people);

                if (
                    !metadata.name ||
                    !metadata.email ||
                    !metadata.phone ||
                    !metadata.date ||
                    !metadata.time ||
                    !Number.isInteger(peopleCount) ||
                    peopleCount < 1
                ) {
                    return res.status(400).json({ error: "Booking metadata missing in payment session" });
                }

                const amountPaid = Number(session.amount_total || 0) / 100;
                const currency = (session.currency || "inr").toUpperCase();

                db.beginTransaction((txErr) => {
                    if (txErr) {
                        console.error(txErr);
                        return res.status(500).json({ error: "Database Error" });
                    }

                    db.query(
                        "INSERT INTO bookings (name, email, phone, date, time, people, payment_mode, payment_method, payment_status, payment_reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            metadata.name,
                            metadata.email,
                            metadata.phone,
                            metadata.date,
                            metadata.time,
                            peopleCount,
                            "online",
                            "card_stripe",
                            "paid",
                            session.payment_intent || sessionId
                        ],
                        (bookingErr, bookingResult) => {
                            if (bookingErr) {
                                return db.rollback(() => {
                                    console.error(bookingErr);
                                    res.status(500).json({ error: "Database Error" });
                                });
                            }

                            const bookingId = bookingResult.insertId;
                            db.query(
                                "INSERT INTO payment_transactions (booking_id, session_id, payment_intent_id, amount_paid, currency, status) VALUES (?, ?, ?, ?, ?, ?)",
                                [
                                    bookingId,
                                    sessionId,
                                    session.payment_intent || null,
                                    amountPaid,
                                    currency,
                                    session.payment_status
                                ],
                                (paymentErr) => {
                                    if (paymentErr) {
                                        return db.rollback(() => {
                                            console.error(paymentErr);
                                            res.status(500).json({ error: "Database Error" });
                                        });
                                    }

                                    db.commit((commitErr) => {
                                        if (commitErr) {
                                            return db.rollback(() => {
                                                console.error(commitErr);
                                                res.status(500).json({ error: "Database Error" });
                                            });
                                        }

                                        return res.json({
                                            message: "Payment confirmed and booking saved",
                                            bookingId
                                        });
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );
    } catch (err) {
        console.error("Stripe confirm error:", err);
        return res.status(500).json({ error: "Unable to confirm payment" });
    }
});

module.exports = router;

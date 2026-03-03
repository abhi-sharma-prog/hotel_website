const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const billRoutes = require("./routes/billRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../client/restaurant-main")));

// API routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "restaurant-fullstack-mysql" });
});

app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
});

app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../client/restaurant-main/index.html"));
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
        return;
    }

    console.error("Server start error:", err);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
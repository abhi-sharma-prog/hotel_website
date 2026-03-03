# Sharma Restaurant - Full Stack Web App

Restaurant website with frontend pages and Node.js + MySQL backend APIs for reservation, contact, billing, feedback, blog, and optional online payment flow.

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Bootstrap
- Backend: Node.js, Express
- Database: MySQL
- Optional payment integration: Stripe

## Project Structure

```text
client/restaurant-main/   Frontend pages and assets
server/                   Express server, routes, DB config
database_schema.sql       Database schema
```

## Features

- Reservation form save to MySQL
- Contact form save to MySQL
- Billing with custom rows/items
- Bill search and bill download verification using mobile last 4 digits
- Feedback submission and latest feedback listing
- Blog post APIs
- Policies page and reservation conditions
- Dark mode support through shared frontend scripts/styles
- Health endpoint: `GET /api/health`

## API Summary

- `POST /api/bookings`
- `POST /api/contact`
- `POST /api/bills`
- `POST /api/bills/search`
- `POST /api/bills/verify-download`
- `POST /api/feedback`
- `GET /api/feedback`
- `GET /api/blogs`
- `POST /api/blogs`
- `GET /api/health`

Optional Stripe routes:

- `POST /api/payments/checkout-session`
- `POST /api/payments/confirm`

## Local Setup

1. Install Node.js 18+ and MySQL 8+.
2. Create database/tables using `database_schema.sql`.
3. Create `.env` from `.env.example` and set your values.
4. Install packages:
   - `npm install`
5. Run server:
   - `npm start`
   - or `npm run dev`
6. Open:
   - `http://localhost:5000`

## Environment Variables

Use `.env.example` as a template:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`
- `CLIENT_BASE_URL`
- `BOOKING_DEPOSIT_PER_PERSON_PAISE`
- `STRIPE_SECRET_KEY`
- `BILL_OTP_TTL_MINUTES`

## Run From VS Code

Use the launch config:

- `Run Backend + Open Browser`

It starts `server/server.js` and opens `http://localhost:5000`.

## Deployment (Example: Render + MySQL)

1. Push code to GitHub.
2. Create a managed MySQL instance.
3. Create a Render web service:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables from `.env.example` in Render.
5. Deploy and test:
   - `https://<your-service>.onrender.com/api/health`

## Notes

- Do not commit `.env` to GitHub.
- If Stripe key is empty, Stripe-based routes should be considered disabled.

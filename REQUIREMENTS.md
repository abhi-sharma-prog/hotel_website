# Project Requirements

## 1. Functional Requirements

1. The system shall allow users to submit table reservations.
2. The system shall store reservation details in MySQL.
3. The system shall allow users to submit contact messages.
4. The system shall store contact messages in MySQL.
5. The system shall allow staff to generate and save custom bills with multiple line items.
6. The system shall allow users/staff to search bills by phone number and/or bill ID.
7. The system shall allow bill download only after verifying the last 4 digits of the registered mobile number.
8. The system shall allow users to submit feedback.
9. The system shall allow the website to display latest feedback/reviews.
10. The system shall support blog post creation and listing APIs.
11. The system shall expose a health endpoint for deployment checks.
12. The system shall display policies including refund, conduct, and late-arrival conditions.
13. The reservation flow shall include a 30-minute waiting rule and cancellation/penalty notices.
14. The frontend shall support dark mode behavior across pages via shared assets.

## 2. Non-Functional Requirements

1. Backend APIs shall return JSON responses with appropriate HTTP status codes.
2. Server and database configuration shall be controlled through environment variables.
3. The app shall run on Node.js 18+ and MySQL 8+.
4. Sensitive values (passwords/API keys) shall not be committed to source control.
5. Core pages should remain usable on desktop and mobile screen sizes.

## 3. Software Dependencies

1. Node.js runtime
2. npm package manager
3. MySQL Server
4. npm packages:
   - express
   - mysql2
   - cors
   - dotenv
   - stripe (optional flow)
   - nodemon (development)

## 4. Environment Configuration

Required variables:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`
- `CLIENT_BASE_URL`
- `BOOKING_DEPOSIT_PER_PERSON_PAISE`
- `STRIPE_SECRET_KEY` (optional if Stripe is enabled)
- `BILL_OTP_TTL_MINUTES`

## 5. Out of Scope / Optional

1. Production SMS OTP delivery is optional and requires third-party SMS provider credentials.
2. Full payment gateway setup is optional unless Stripe keys and webhook setup are provided.

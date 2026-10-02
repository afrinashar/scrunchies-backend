# tuk tails API

## Local setup

1. Copy `.env.example` to `.env` and set `MONGODB_URL`, `CLIENT_ORIGIN`, and a unique `ADMIN_ACCESS_KEY` of at least 32 random characters.
2. Install dependencies with `npm install`.
3. Start the API with `npm start` (default port `8000`).

Keep `.env` private. The admin key protects order details and all product create, update, upload, and delete routes. Order creation is public and limited to 5 requests per IP every 15 minutes; admin routes are limited to 20 requests per IP every 15 minutes.

Orders are stored with server-read product prices. Admins can review the newest 100 orders at `GET /admin/orders` and change status with `PATCH /admin/orders/:id` using the `x-admin-key` header.
# scrunchies-backend
# 🛒 SmartCart Hub

> Luxury dark gold ecommerce platform for physical products.

---

## Quick Start

### Terminal 1 — Backend (port 5001)
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 — Frontend (port 3000)
```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000**

---

## Demo Accounts

| Role     | Email                        | Password     |
|----------|------------------------------|--------------|
| Admin    | admin@smartcarthub.com       | admin123     |
| Customer | jane@example.com             | password123  |

---

## Features

- 🏠 **Homepage** — Hero, featured products, category strip, value props
- 🛍 **Shop** — Filter by category, search, sort by price/rating
- 📦 **Product pages** — Full detail, quantity selector, stock indicator
- 🛒 **Cart** — Persistent cart (localStorage), quantity controls, order summary
- 💳 **Checkout** — Shipping address, payment method selection
- 📋 **Orders** — Full order history with status tracking
- ⚙️ **Admin panel** — Revenue stats, manage orders & products

## API Endpoints

| Method | Route                    | Description             |
|--------|--------------------------|-------------------------|
| POST   | /api/auth/register       | Register customer       |
| POST   | /api/auth/login          | Login                   |
| GET    | /api/products            | List / filter products  |
| GET    | /api/products/:id        | Product detail          |
| POST   | /api/orders              | Place order             |
| GET    | /api/orders/mine         | My orders               |
| GET    | /api/orders              | All orders (admin)      |
| PUT    | /api/orders/:id/status   | Update order (admin)    |
| GET    | /api/stats               | Store stats             |

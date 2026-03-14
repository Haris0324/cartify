# Cartify – MERN Ecommerce Platform

A full-stack ecommerce website built with MongoDB, Express, React, and Node.js. Includes Stripe payments, auth, cart, orders, reviews, wishlist, and admin dashboard.

## Features

- **User Auth** – Sign up, sign in, JWT-based sessions
- **Products** – Browse, search, filter, sort
- **Cart** – Add, update, remove; guest + logged-in cart merge
- **Checkout** – Stripe payment integration
- **Orders** – Order history and status
- **Reviews** – Product reviews and ratings
- **Wishlist** – Save products (logged-in users)
- **Admin** – Order management dashboard

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React 19, React Router, Vite
- **Payments:** Stripe

## Quick Start

```bash
npm run install:all
npm run seed    # optional – sample products
npm run dev     # starts backend + frontend
```

- Backend: http://localhost:5000  
- Frontend: http://localhost:3000  

## Configuration

Create `.env` in the project root. See **SETUP.md** for MongoDB and Stripe setup.

## Default Admin

After running `npm run seed`:
- Email: admin@cartify.com
- Password: admin123

# Cartify - Setup Guide

This guide explains how to configure **MongoDB** and **Stripe** for the Cartify ecommerce platform.

---

## 1. Environment Variables

Create a file named `.env` in the **root folder** (`d:\ecommerce\.env`) and add the following:

```env
# Copy from .env.example and fill in your values
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 2. MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account.
2. Create a new cluster (choose the free M0 tier).
3. Click **Connect** → **Connect your application** → Copy the connection string.
4. Replace `<password>` in the string with your database user password.
5. Add your IP to the Network Access allowlist (or use `0.0.0.0/0` for development).
6. Put the full URI in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cartify?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. Install MongoDB Community from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service.
3. In `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/cartify
   ```

### JWT Secret

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Use the output as `JWT_SECRET` in `.env`.

---

## 3. Stripe Setup

### Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) and sign up / log in.
2. Switch to **Test mode** (toggle in the sidebar).
3. Go to **Developers** → **API keys**.
4. Copy:
   - **Publishable key** → `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - **Secret key** → `STRIPE_SECRET_KEY` (starts with `sk_test_`)

### Webhook (for production / order status updates)

1. In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**.
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Events: `payment_intent.succeeded`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

For local testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

---

## 4. File Locations Summary

| What | File | Variable / Location |
|------|------|---------------------|
| MongoDB URI | `d:\ecommerce\.env` | `MONGODB_URI` |
| JWT Secret | `d:\ecommerce\.env` | `JWT_SECRET` |
| Stripe Secret Key | `d:\ecommerce\.env` | `STRIPE_SECRET_KEY` |
| Stripe Publishable Key | `d:\ecommerce\.env` | `STRIPE_PUBLISHABLE_KEY` |
| Stripe Webhook Secret | `d:\ecommerce\.env` | `STRIPE_WEBHOOK_SECRET` |

**Important:** Create `.env` in the **ecommerce root folder** (same level as `package.json` and `server/`).

---

## 5. Run the Application

```bash
# Install dependencies
npm run install:all

# Seed sample products (optional)
npm run seed

# Start backend and frontend together
npm run dev
```

- Backend: http://localhost:5000  
- Frontend: http://localhost:3000  

---

## 6. OAuth (Google & GitHub)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create OAuth 2.0 Client ID (Web application).
3. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback` (or your API_URL + `/api/auth/google/callback`).
4. Add to `.env`:
   - `GOOGLE_CLIENT_ID=xxx`
   - `GOOGLE_CLIENT_SECRET=xxx`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New.
2. Set callback URL: `http://localhost:5000/api/auth/github/callback`.
3. Add to `.env`:
   - `GITHUB_CLIENT_ID=xxx`
   - `GITHUB_CLIENT_SECRET=xxx`

### OAuth Callback (Google/GitHub "Connection Refused")
If you see "localhost refused to connect" after signing in with Google or GitHub, **both backend and frontend must be running**. Use:
```bash
npm run dev
```
This starts the backend (port 5000) and frontend (port 3000). OAuth redirects to `http://localhost:3000/auth/callback` — the React app must be running to receive it. Do not run only the backend.

### Admin Access
- **Sign in as Admin:** Click "Sign in as Admin" on the login page, then use admin credentials.
- Default admin: `admin@cartify.com` / `admin123` (after `npm run seed`).

---

## 7. Password Reset (Forgot Password)

Add to `.env` to send reset emails:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@cartify.com
```
Without SMTP, the reset link is logged in the server console when you request a reset.

---

## 8. Default Admin Account (after seed)

- **Email:** admin@cartify.com  
- **Password:** admin123  

Use this to access the Admin dashboard at `/admin`.

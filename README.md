# DevGear — E-Commerce Application

DevGear is a full-stack MERN e-commerce application built for developers, designers, and creators to browse and purchase technology products and accessories.

## Live Demo

- **Frontend:** https://devgear-ecommerce.vercel.app
- **Backend:** https://devgear-ecommerce.onrender.com
- **GitHub:** https://github.com/StonnedSanta/devgear-ecommerce

> The backend is hosted on Render, so the first request after inactivity may take a few seconds while the service wakes up.

## Features

### Customer

- Browse products and view product details
- Add, update, and remove cart items
- JWT-based authentication
- Cash on Delivery (COD)
- Razorpay test-mode card payments
- Stock availability validation
- Responsive user interface

### Admin

- Protected admin dashboard
- Create, update, and delete products
- Manage prices, categories, descriptions, images, and stock
- View total revenue and orders
- Monitor low-stock products
- Sales trend and category-wise sales analytics

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT, BCrypt
- **Payments:** Razorpay Test Mode
- **Deployment:** Vercel (Frontend), Render (Backend)

## Project Structure

```text
devgear-ecommerce/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/StonnedSanta/devgear-ecommerce
cd devgear-ecommerce
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

**Frontend (`frontend/.env`)**

```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (`backend/.env`)**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Run the application

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | Get products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/orders` | Create order |
| GET | `/api/admin/orders` | Get admin orders |
| POST | `/api/payments/create-order` | Create payment |
| POST | `/api/payments/verify` | Verify payment |

## Deployment

### Backend — Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Configure MongoDB, JWT, CORS, and Razorpay environment variables.

### Frontend — Vercel

- Root directory: `frontend`
- Framework: Vite
- Environment variable:

```env
VITE_API_URL=https://devgear-ecommerce.onrender.com/api
```

## Security

- Passwords are hashed using BCrypt.
- JWT authentication and role-based authorization are implemented.
- Admin routes are protected.
- Product stock is validated during order creation.
- Sensitive credentials are stored in environment variables.

> Razorpay is configured for test-mode payments. Never commit secrets or `.env` files to the repository.

## Author

**Anuj Srivastava**

Built as a technical assignment for the Full Stack Web Developer selection process.
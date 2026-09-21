# DevGear E-Commerce Application

DevGear is a full-stack MERN e-commerce application designed for developers to browse, filter, and purchase tech gear and development tools.

## Tech Stack

- **Frontend:** React, Vite, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Deployment:** Vercel (Frontend), Render (Backend)

## Environment Variables

### Frontend Configuration (frontend/.env)
- `VITE_API_URL`: Base API URL for backend communication (e.g., `http://localhost:5000/api` locally or `https://devgear-backend.onrender.com/api` in production).

### Backend Configuration (backend/.env)
- `PORT`: Local server port (e.g., `5000`)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for authentication tokens
- `CLIENT_URL`: Frontend client origin for CORS configuration

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/devgear-ecommerce.git
   cd devgear-ecommerce
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Run local servers:**
   - Start the backend server (`http://localhost:5000`):
     ```bash
     cd backend
     npm run dev
     ```
   - Start the frontend development server (`http://localhost:5173`):
     ```bash
     cd frontend
     npm run dev
     ```

## Database Seeding

- **Seed local database:**
  ```bash
  cd backend
  npm run seed
  ```

- **Seed production database (MongoDB Atlas):**
  ```bash
  cd backend
  MONGO_URI="mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/devgear?retryWrites=true&w=majority" npm run seed
  ```

## Deployment

### Backend (Render)
1. Create a Web Service connected to your repository.
2. Set root directory to `backend`.
3. Set build command to `npm install` and start command to `node server.js`.
4. Configure environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).

### Frontend (Vercel)
1. Import your repository into Vercel with the root directory set to `frontend`.
2. Select Vite as the framework preset.
3. Add the `VITE_API_URL` environment variable as a Config type.
4. Deploy.
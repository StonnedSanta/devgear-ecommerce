import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import { verifyToken, verifyAdmin } from './middleware/auth.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devgear';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_devgear_key_123';

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Database connection error:', err));

// AUTH ROUTES

// 1. Register User (Default role set to 'buyer' for security)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'buyer' // Hardcoded to prevent privilege escalation via body
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login User / Admin
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUCT ROUTES

// Public: Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-Only: Add new product
app.post('/api/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin-Only: Delete product
app.delete('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ORDER & CHECKOUT ROUTES

// Public: Create Order (Simulated Payment)
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, items, totalAmount, paymentMethod } = req.body;
    const orderId = 'DG-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = new Order({ orderId, customerName, items, totalAmount, paymentMethod });
    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public: Get Order for Tracking
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-Only: Get all orders
app.get('/api/admin/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-Only: Update Order Status
app.put('/api/admin/orders/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ANALYTICS ROUTE (Admin-Only)

app.get('/api/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: {$sum: 1 } } }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      chartData: {
        labels: categoryStats.map((c) => c._id),
        datasets: [
          {
            label: 'Product Categories',
            data: categoryStats.map((c) => c.count),
            backgroundColor: ['#6366f1', '#10b981', '#f59e0b']
          }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
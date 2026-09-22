
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

import Product from './models/Product.js';
import Order from './models/Order.js';

import {
  verifyToken,
  verifyAdmin
} from './middleware/auth.js';

import authRoutes from './routes/auth.js';

const app = express();

// CONFIGURATION

const PORT = Number(process.env.PORT) || 5000;

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  })
  : null;

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error(
    'Missing MongoDB connection string.'
  );

  console.error(
    'Set MONGO_URI or MONGODB_URI in your environment.'
  );

  process.exit(1);
}

// CORS CONFIGURATION

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from tools such as Postman and curl.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(
        `Blocked CORS origin: ${origin}`
      );

      return callback(
        new Error('CORS origin is not allowed')
      );
    },
    credentials: true
  })
);

// GLOBAL MIDDLEWARE

app.use(
  express.json({
    limit: '1mb'
  })
);

// HELPER FUNCTIONS

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createOrderId = () => {
  return `DG-${crypto.randomUUID()}`;
};

const validateProductPayload = (payload) => {
  const {
    title,
    price,
    category,
    image,
    description,
    stock
  } = payload;

  if (
    typeof title !== 'string' ||
    !title.trim()
  ) {
    return 'Product title is required';
  }

  if (
    typeof category !== 'string' ||
    !category.trim()
  ) {
    return 'Product category is required';
  }

  if (
    typeof image !== 'string' ||
    !image.trim()
  ) {
    return 'Product image is required';
  }

  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return 'Product price must be a valid non-negative number';
  }

  if (
    typeof stock !== 'number' ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return 'Product stock must be a non-negative integer';
  }

  if (
    description !== undefined &&
    typeof description !== 'string'
  ) {
    return 'Product description must be a string';
  }

  return null;
};

// HEALTH CHECK

app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'DevGear backend is running'
  });
});

// AUTH ROUTES

app.use('/api/auth', authRoutes);

// PRODUCT ROUTES

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    console.error(
      'Fetch products error:',
      error.message
    );

    return res.status(500).json({
      message: 'Unable to fetch products'
    });
  }
});

// Get a single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error(
      'Fetch product error:',
      error.message
    );

    return res.status(500).json({
      message: 'Unable to fetch product'
    });
  }
});

// Create a product
app.post(
  '/api/products',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const {
        title,
        price,
        category,
        image,
        description = '',
        stock
      } = req.body;

      const payload = {
        title,
        price,
        category,
        image,
        description,
        stock
      };

      const validationError =
        validateProductPayload(payload);

      if (validationError) {
        return res.status(400).json({
          message: validationError
        });
      }

      const product = new Product(payload);

      await product.save();

      return res.status(201).json(product);
    } catch (error) {
      console.error(
        'Create product error:',
        error.message
      );

      return res.status(400).json({
        message: 'Unable to create product'
      });
    }
  }
);

// Update a product
app.put(
  '/api/products/:id',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: 'Invalid product ID'
        });
      }

      const {
        title,
        price,
        category,
        image,
        description = '',
        stock
      } = req.body;

      const payload = {
        title,
        price,
        category,
        image,
        description,
        stock
      };

      const validationError =
        validateProductPayload(payload);

      if (validationError) {
        return res.status(400).json({
          message: validationError
        });
      }

      const updatedProduct =
        await Product.findByIdAndUpdate(
          id,
          payload,
          {
            new: true,
            runValidators: true
          }
        );

      if (!updatedProduct) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.json(updatedProduct);
    } catch (error) {
      console.error(
        'Update product error:',
        error.message
      );

      return res.status(400).json({
        message: 'Unable to update product'
      });
    }
  }
);

// Delete a product
app.delete(
  '/api/products/:id',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: 'Invalid product ID'
        });
      }

      const deletedProduct =
        await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.json({
        message: 'Product deleted successfully',
        product: deletedProduct
      });
    } catch (error) {
      console.error(
        'Delete product error:',
        error.message
      );

      return res.status(500).json({
        message: 'Unable to delete product'
      });
    }
  }
);

// ORDER ROUTES

const createOrderWithStock = async ({
  customerName,
  items,
  paymentMethod
}) => {
  const session = await mongoose.startSession();

  try {
    const validPaymentMethods = ['UPI', 'CARD', 'COD'];

    if (
      typeof customerName !== 'string' ||
      !customerName.trim()
    ) {
      throw new Error('Customer name is required');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    for (const item of items) {
      if (
        !item.productId ||
        !isValidObjectId(item.productId)
      ) {
        throw new Error('Each item must contain a valid productId');
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw new Error('Each item quantity must be at least 1');
      }
    }

    const quantityByProduct = new Map();

    for (const item of items) {
      const currentQuantity =
        quantityByProduct.get(item.productId) || 0;

      quantityByProduct.set(
        item.productId,
        currentQuantity + item.quantity
      );
    }

    const productIds = [...quantityByProduct.keys()];
    let createdOrder;

    await session.withTransaction(async () => {
      const products = await Product.find({
        _id: { $in: productIds }
      }).session(session);

      if (products.length !== productIds.length) {
        throw new Error('One or more products do not exist');
      }

      const productMap = new Map(
        products.map((product) => [
          product._id.toString(),
          product
        ])
      );

      const orderItems = [];
      let totalAmount = 0;

      for (const [productId, quantity] of quantityByProduct) {
        const product = productMap.get(productId);

        if (!product) {
          throw new Error('Product not found');
        }

        if (product.stock < quantity) {
          throw new Error(
            `Insufficient stock for ${product.title}`
          );
        }

        totalAmount += product.price * quantity;

        orderItems.push({
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity
        });
      }

      totalAmount = Number(totalAmount.toFixed(2));

      for (const [productId, quantity] of quantityByProduct) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            stock: { $gte: quantity }
          },
          {
            $inc: { stock: -quantity }
          },
          {
            new: true,
            session
          }
        );

        if (!updatedProduct) {
          throw new Error(
            'Stock changed. Please review your cart and try again.'
          );
        }
      }

      createdOrder = new Order({
        orderId: createOrderId(),
        customerName: customerName.trim(),
        items: orderItems,
        totalAmount,
        paymentMethod
      });

      await createdOrder.save({ session });
    });

    return createdOrder;
  } finally {
    await session.endSession();
  }
};

// Create a normal order (used for COD).
app.post('/api/orders', async (req, res) => {
  try {
    const createdOrder = await createOrderWithStock(req.body);

    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error(
      'Create order error:',
      error.message
    );

    return res.status(400).json({
      message: error.message || 'Failed to create order'
    });
  }
});

// Create a Razorpay payment order.
// Product prices must be stored in INR for this integration.
app.post('/api/payments/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        message: 'Razorpay is not configured on the server'
      });
    }

    const { customerName, items } = req.body;

    if (
      typeof customerName !== 'string' ||
      !customerName.trim()
    ) {
      return res.status(400).json({
        message: 'Customer name is required'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Order must contain at least one item'
      });
    }

    const quantityByProduct = new Map();

    for (const item of items) {
      if (
        !item.productId ||
        !isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: 'Invalid product or quantity'
        });
      }

      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) || 0) + item.quantity
      );
    }

    const products = await Product.find({
      _id: { $in: [...quantityByProduct.keys()] }
    });

    if (products.length !== quantityByProduct.size) {
      return res.status(400).json({
        message: 'One or more products do not exist'
      });
    }

    let totalAmount = 0;

    for (const product of products) {
      const quantity = quantityByProduct.get(product._id.toString());

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title}`
        });
      }

      totalAmount += product.price * quantity;
    }

    totalAmount = Number(totalAmount.toFixed(2));

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `DG-${Date.now()}`,
      notes: {
        customerName: customerName.trim()
      }
    });

    return res.status(201).json({
      keyId: razorpayKeyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    console.error(
      'Create Razorpay order error:',
      error.message
    );

    return res.status(500).json({
      message: 'Unable to create payment order'
    });
  }
});

// Verify Razorpay payment, then create the real DevGear order
// and deduct stock only after signature verification succeeds.
app.post('/api/payments/verify', async (req, res) => {
  try {
    if (!razorpayKeySecret) {
      return res.status(500).json({
        message: 'Razorpay is not configured on the server'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      items,
      paymentMethod
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: 'Missing Razorpay payment details'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!signaturesMatch) {
      return res.status(400).json({
        message: 'Payment verification failed'
      });
    }

    const createdOrder = await createOrderWithStock({
      customerName,
      items,
      paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'CARD'
    });

    return res.status(201).json({
      message: 'Payment verified and order created',
      order: createdOrder
    });
  } catch (error) {
    console.error(
      'Verify Razorpay payment error:',
      error.message
    );

    return res.status(400).json({
      message: error.message || 'Unable to verify payment'
    });
  }
});

// Get an order by order ID
app.get(
  '/api/orders/:orderId',
  async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findOne({
        orderId
      });

      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      return res.json(order);
    } catch (error) {
      console.error(
        'Fetch order error:',
        error.message
      );

      return res.status(500).json({
        message: 'Unable to fetch order'
      });
    }
  }
);

// ADMIN ORDER ROUTES

// Get all orders
app.get(
  '/api/admin/orders',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 });

      return res.json(orders);
    } catch (error) {
      console.error(
        'Fetch admin orders error:',
        error.message
      );

      return res.status(500).json({
        message: 'Unable to fetch orders'
      });
    }
  }
);

// Update order status
app.put(
  '/api/admin/orders/:id/status',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = [
        'Placed',
        'Processing',
        'Shipped',
        'Delivered'
      ];

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: 'Invalid order ID'
        });
      }

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid order status'
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          id,
          { status },
          {
            new: true,
            runValidators: true
          }
        );

      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      return res.json(order);
    } catch (error) {
      console.error(
        'Update order status error:',
        error.message
      );

      return res.status(400).json({
        message: 'Unable to update order status'
      });
    }
  }
);

// ADMIN ANALYTICS

app.get(
  '/api/admin/stats',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const totalProducts =
        await Product.countDocuments();

      const totalOrders =
        await Order.countDocuments();

      const lowStockProducts =
        await Product.countDocuments({
          stock: {
            $lte: 5
          }
        });

      const revenueStats =
        await Order.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: '$totalAmount'
              }
            }
          }
        ]);

      const totalRevenue =
        revenueStats[0]?.totalRevenue || 0;

      const categoryStats =
        await Product.aggregate([
          {
            $group: {
              _id: '$category',
              count: {
                $sum: 1
              }
            }
          },
          {
            $sort: {
              count: -1
            }
          }
        ]);

      return res.json({
        totalProducts,
        totalOrders,
        totalRevenue: Number(
          totalRevenue.toFixed(2)
        ),
        lowStockProducts,

        chartData: {
          labels: categoryStats.map(
            (category) => category._id
          ),

          datasets: [
            {
              label: 'Product Categories',

              data: categoryStats.map(
                (category) => category.count
              ),

              backgroundColor: [
                '#6366f1',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#ec4899',
                '#14b8a6'
              ]
            }
          ]
        }
      });
    } catch (error) {
      console.error(
        'Analytics error:',
        error.message
      );

      return res.status(500).json({
        message: 'Unable to fetch analytics'
      });
    }
  }
);

// ERROR HANDLING

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(
    'Unhandled server error:',
    error.message
  );

  return res.status(500).json({
    message: 'Internal server error'
  });
});

// DATABASE CONNECTION & SERVER STARTUP

const startServer = async () => {
  try {
    console.log(
      'Connecting to MongoDB...'
    );

    await mongoose.connect(
      MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000
      }
    );

    console.log(
      'MongoDB connected successfully'
    );

    app.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          `Health check: http://localhost:${PORT}/api/health`
        );
      }
    );
  } catch (error) {
    console.error(
      'Database connection error:',
      error.message
    );

    process.exitCode = 1;
  }
};

startServer();
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        price: Number,
        quantity: Number
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'CARD', 'COD'], required: true },
    status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered'], default: 'Placed' }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  phone: { type: String, required: true },
  wilaya: { type: String, required: true }, 
  address: { type: String }, 
  desk: { type: String }, 
  deliveryType: { type: String, enum: ['home', 'desk'], required: true },
  deliveryPrice: { type: Number, default: 0 },
  store: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    image: String,
    size: String,
    quantity: Number,
    maxQuantity: Number,
  }],
  subtotal: { type: Number },
  totalPrice: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_delivery', 'reached', 'canceled'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

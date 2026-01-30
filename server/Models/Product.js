import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
    price: { type: Number, required: true, min: 0 },
    images: [
      {
        url: { type: String, required: true },
        sizes: [{ size: { type: String, required: true }} ],
      },
    ],
    store : { type: String , required: true },
    showOnProductsPage: { type: Boolean, default: false },
    showOnTrendingPage: { type: Boolean, default: false },
    showOnBestOffersPage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);

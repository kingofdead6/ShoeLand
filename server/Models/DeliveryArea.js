import mongoose from 'mongoose';

const deliveryAreaSchema = new mongoose.Schema({
  wilaya: { type: String, required: true, trim: true },
  store: { type: String, enum: ['DDS.Piyou', 'AB-Zone', 'Tchingo Mima 2'], required: true},
  company: {type: String,enum: ['yalidine', 'zr-Express'],required: true,},
  priceHome: { type: Number, default: 600 },
  priceDesk: { type: Number, default: 700 },
  desks: [{name: { type: String, required: true }}],
});

deliveryAreaSchema.index({ store: 1, company: 1, wilaya: 1 }, { unique: true });

export default mongoose.model('DeliveryArea', deliveryAreaSchema);

import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    unique: true,
    enum: ['DDS.Piyou', 'AB-Zone', 'Tchingo Mima 2'],
  },
  deliveryCompany: {
    type: String,
    enum: ['yalidine', 'zr-Express'],
    required: true,
    default: function () {
      if (this.storeName === 'Tchingo Mima 2') return 'yalidine';
      return 'zr-Express';
    },
  },
}, { timestamps: true });

export default mongoose.model('StoreSettings', storeSettingsSchema);

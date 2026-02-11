import mongoose from 'mongoose';

const BillingSchema = new mongoose.Schema({
  address: { type: String, default: '' },
  area: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  state: { type: String, default: '' },
  stateCode: { type: String, default: '' },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  companyName: { type: String, required: true },
  companyGroup: { type: String, required: true }, 
  entity: { type: String, required: true },
  product: { type: String, required: true },
  orderType: { type: String, required: true },
  status: { type: String, required: true },
  capacity: { type: String, default: '' },
  lsiId: { type: String, default: '' },
  amount: { type: String, default: '' },
  pcdDate: { type: String, default: '' },
  terminateDate: { type: String, default: '' },
  endA: { type: String, default: '' },
  endB: { type: String, default: '' },
  billing1: { type: BillingSchema, default: () => ({}) },
  billing2: { type: BillingSchema, default: () => ({}) }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

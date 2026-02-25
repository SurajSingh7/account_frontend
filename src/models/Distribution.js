import mongoose from 'mongoose';

// Each individual order's slice of a distribution
const DistributionEntrySchema = new mongoose.Schema({
  orderId:     { type: String, required: true },
  companyName: { type: String, default: '' },
  state:       { type: String, default: '' },
  entity:      { type: String, default: '' },
  splitPct:    { type: Number, default: 100 },   // e.g. 50 or 100
  isSplit:     { type: Boolean, default: false },
  amount:      { type: Number, required: true, default: 0 },
  notes:       { type: String, default: '' },
  date:        { type: String, required: true },  // DD-MM-YYYY (payment date)
  month:       { type: String, required: true },  // "January 2026" (billing month)
}, { _id: false });

const DistributedPaymentSchema = new mongoose.Schema({
  // ── Core identifiers ─────────────────────────────────────────
  companyGroup: { type: String, required: true, index: true },

  paymentType: {
    type: String,
    required: true,
    enum: ['receivedDetails', 'tdsProvision', 'tdsConfirm'],
    index: true,
  },

  // ── Date / period ────────────────────────────────────────────
  paymentDate:  { type: String, required: true },   // DD-MM-YYYY
  billingMonth: { type: String, required: true },   // "January 2026"

  // ── Amounts ──────────────────────────────────────────────────
  totalAmount: { type: Number, required: true, default: 0 },

  // ── Meta ─────────────────────────────────────────────────────
  notes:      { type: String, default: '' },
  entryCount: { type: Number, default: 0 },

  // ── Per-order breakdown ───────────────────────────────────────
  entries: { type: [DistributionEntrySchema], default: [] },

}, { timestamps: true });

// Compound indices for common query patterns
DistributedPaymentSchema.index({ companyGroup: 1, paymentType: 1, createdAt: -1 });
DistributedPaymentSchema.index({ billingMonth: 1, createdAt: -1 });
DistributedPaymentSchema.index({ paymentDate: 1 });

export default mongoose.models.DistributedPayment ||
  mongoose.model('DistributedPayment', DistributedPaymentSchema);
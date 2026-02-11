import mongoose from 'mongoose';

const ReceivedDetailSchema = new mongoose.Schema({
  date: { type: String, required: true }, // format: DD-MM-YYYY
  amount: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '' }
}, { _id: false });

const MiscellaneousSellSchema = new mongoose.Schema({
  date: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '' }
}, { _id: false });

const TdsProvisionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '' }
}, { _id: false });

const TdsConfirmSchema = new mongoose.Schema({
  date: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '' }
}, { _id: false });

// New Credit Notes Schema
const CreditNoteSchema = new mongoose.Schema({
  date: { type: String, required: true }, // format: DD-MM-YYYY
  amount: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '' }
}, { _id: false });

const MonthlyBillingSchema = new mongoose.Schema({
  orderId: { type: String, required: true, index: true },
  month: { type: String, required: true }, // format: "January 2026"
  startDate: { type: String, required: true }, // format: DD-MM-YYYY
  endDate: { type: String, required: true }, // format: DD-MM-YYYY
  billingDays: { type: Number, required: true },
  perDayRate: { type: Number, required: true },
  
  receivedDetails: { type: [ReceivedDetailSchema], default: [] },
  miscellaneousSell: { type: [MiscellaneousSellSchema], default: [] },
  tdsProvision: { type: [TdsProvisionSchema], default: [] },
  tdsConfirm: { type: [TdsConfirmSchema], default: [] },
  creditNotes: { type: [CreditNoteSchema], default: [] }, // Added credit notes
  
  monthlyBilling: { type: Number, required: true }, // Base amount without GST
  gst: { type: Number, required: true }, // 18% of monthlyBilling
  totalWithGst: { type: Number, required: true }, // monthlyBilling + gst
  invoiceNumber: { type: String, default: '' },
  
  // Additional fields for tracking
  state: { type: String, default: '' },
  splitKey: { type: String, default: '100' }, // '100' or '50' for split billing
  capacity: { type: Number, default: 0 },
  companyName: { type: String, default: '' },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['draft', 'generated', 'invoiced', 'paid'], 
    default: 'generated' 
  },
  
  isPcdMonth: { type: Boolean, default: false },
  isTerminateMonth: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Compound index for efficient querying
MonthlyBillingSchema.index({ orderId: 1, month: 1, state: 1, splitKey: 1 }, { unique: true });

export default mongoose.models.MonthlyBilling || mongoose.model('MonthlyBilling', MonthlyBillingSchema);

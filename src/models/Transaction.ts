import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType =
  | 'expense'
  | 'income'
  | 'investment'
  | 'withdrawal'
  | 'dividend'
  | 'asset_sale';

export type PaymentMethod = 'Cash' | 'Bank' | 'Card' | 'Other';

export interface ITransaction extends Document {
  transactionDate: Date;
  transactionType: TransactionType;
  amount: number;
  categoryId?: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  assetId?: mongoose.Types.ObjectId;
  invoiceNumber?: string;
  paymentMethod: PaymentMethod;
  profitPeriod?: string;
  reason?: string;
  customerName?: string;
  remarks?: string;
  attachmentUrl?: string;
  status: 'active' | 'void';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionDate: { type: Date, required: true, default: Date.now },
    transactionType: {
      type: String,
      enum: ['expense', 'income', 'investment', 'withdrawal', 'dividend', 'asset_sale'],
      required: true,
    },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than 0'] },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    partnerId: { type: Schema.Types.ObjectId, ref: 'Partner' },
    personId: { type: Schema.Types.ObjectId, ref: 'Person' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset' },
    invoiceNumber: { type: String, default: '' },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank', 'Card', 'Other'],
      default: 'Cash',
    },
    profitPeriod: { type: String, default: '' },
    reason: { type: String, default: '' },
    customerName: { type: String, default: '' },
    remarks: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    status: { type: String, enum: ['active', 'void'], default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TransactionSchema.index({ transactionDate: -1, status: 1 });
TransactionSchema.index({ transactionType: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;

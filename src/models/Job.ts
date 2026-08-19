import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  jobNumber: string;
  customerName?: string;
  description?: string;
  invoiceNumber?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    jobNumber: { type: String, required: true, unique: true },
    customerName: { type: String, default: '' },
    description: { type: String, default: '' },
    invoiceNumber: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
export default Job;

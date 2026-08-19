import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPerson extends Document {
  name: string;
  phone?: string;
  role?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const Person: Model<IPerson> =
  mongoose.models.Person || mongoose.model<IPerson>('Person', PersonSchema);
export default Person;

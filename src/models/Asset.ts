import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAsset extends Document {
  name: string;
  assetType?: string;
  purchaseDate?: Date;
  purchaseAmount?: number;
  saleDate?: Date;
  saleAmount?: number;
  status: 'active' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    name: { type: String, required: true },
    assetType: { type: String, default: 'General Asset' },
    purchaseDate: { type: Date, default: Date.now },
    purchaseAmount: { type: Number, default: 0 },
    saleDate: { type: Date },
    saleAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'sold'], default: 'active' },
  },
  { timestamps: true }
);

const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
export default Asset;

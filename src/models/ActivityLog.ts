import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  user: string; // The name of the user who performed the action
  userId?: mongoose.Types.ObjectId; // The ID of the user (optional, for linking)
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER';
  entityType: 'Transaction' | 'Category' | 'Partner' | 'Person' | 'Asset' | 'Vehicle' | 'System';
  entityId?: mongoose.Types.ObjectId;
  details: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema(
  {
    user: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'OTHER'] },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { updatedAt: false } }
);

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

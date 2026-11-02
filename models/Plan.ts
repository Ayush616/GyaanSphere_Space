import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  libraryId: mongoose.Types.ObjectId;
  name: string;              // e.g., "Full Day Monthly", "Morning Shift"
  durationMonths: number;    // e.g., 1, 3, 6
  price: number;             // e.g., 1100
  description: string;       // e.g., "Access from 6 AM to 10 PM"
  isActive: boolean;
}

const PlanSchema = new Schema<IPlan>({
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  name: { type: String, required: true },
  durationMonths: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
});

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
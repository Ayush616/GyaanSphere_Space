import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  libraryId: mongoose.Types.ObjectId;
  name: string;
  aadhaarId: string;
  mobile: string;
  email: string;
  planName: string;
  seatNumber: string;
  startDate: Date;
  expiryDate: Date;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  totalFee: number;      // Total agreed amount after discount
  feesPaid: number;      // Amount paid so far (Upfront)
  dueAmount: number;     // Remaining balance to be paid later
  discount: number;
  paymentMode: 'Cash' | 'UPI' | 'Both (Cash & UPI)';
  cashAmount?: number;
  upiAmount?: number;
  remark?: string;
  paymentHistory: {
    amount: number;
    date?: Date;
    paymentDate?: Date;
    mode: 'Cash' | 'UPI' | 'Both (Cash & UPI)';
    cashAmount?: number;
    upiAmount?: number;
    remark?: string;
  }[];
}

const MemberSchema = new Schema<IMember>({
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  name: { type: String, required: true },
  aadhaarId: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  planName: { type: String, required: true },
  seatNumber: { type: String, required: true },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Expiring Soon', 'Expired'], default: 'Active' },
  totalFee: { type: Number, required: true },
  feesPaid: { type: Number, required: true, default: 0 },
  dueAmount: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Both (Cash & UPI)'], required: true },
  cashAmount: { type: Number, default: 0 },
  upiAmount: { type: Number, default: 0 },
  remark: { type: String },
  paymentHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    paymentDate: { type: Date, default: Date.now },
    mode: { type: String, enum: ['Cash', 'UPI', 'Both (Cash & UPI)'], required: true },
    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    remark: { type: String }
  }],
});

export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
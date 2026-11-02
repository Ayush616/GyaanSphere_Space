import mongoose, { Schema, Document } from 'mongoose';

export interface ICashTransaction extends Document {
  libraryId: mongoose.Types.ObjectId;
  type: 'INFLOW' | 'OUTFLOW';
  category: 'Student Fee (Cash)' | 'Student Due (Cash)' | 'Expense' | 'Withdrawal' | 'Adjustment' | 'Other';
  amount: number;
  paymentDate: Date;
  memberName?: mongoose.Types.ObjectId; // Optional link if it relates to a student
  personName?: string;                 // e.g. "AC Repair Guy", "Owner"
  remark: string;
  recordedBy: string;                  // Staff or Owner username/ID
  createdAt: Date;
}

const CashTransactionSchema = new Schema<ICashTransaction>({
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  type: { type: String, enum: ['INFLOW', 'OUTFLOW'], required: true },
  category: { 
    type: String, 
    enum: ['Student Fee (Cash)', 'Student Due (Cash)', 'Expense', 'Withdrawal', 'Adjustment', 'Other'], 
    required: true 
  },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true, default: Date.now },
  memberName: { type: Schema.Types.ObjectId, ref: 'Member' },
  personName: { type: String },
  remark: { type: String, required: true },
  recordedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.CashTransaction || mongoose.model<ICashTransaction>('CashTransaction', CashTransactionSchema);
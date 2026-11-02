import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffAttendance extends Document {
  libraryId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  staffName: string;
  punchInTime: Date;
  punchOutTime?: Date;
  punchInIp: string;
  status: 'Present' | 'Checked Out';
  createdAt: Date;
}

const StaffAttendanceSchema = new Schema<IStaffAttendance>({
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  staffName: { type: String, required: true },
  punchInTime: { type: Date, required: true, default: Date.now },
  punchOutTime: { type: Date },
  punchInIp: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Checked Out'], default: 'Present' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.StaffAttendance || mongoose.model<IStaffAttendance>('StaffAttendance', StaffAttendanceSchema);
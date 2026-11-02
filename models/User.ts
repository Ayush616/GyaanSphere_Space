import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  libraryId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'library_owner' | 'library_staff';
  mobile: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['library_owner', 'library_staff'], required: true },
  mobile: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
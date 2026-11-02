import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatSection {
  prefix: string;      // e.g., 'A', 'B', 'C'
  count: number;       // e.g., 20 seats in section A
}

export interface ILibrary extends Document {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  mobile: string;
  address: string;
  city: string;
  totalSeats: number;
  seatSections: ISeatSection[]; // 👈 Array of sections like A, B, C
  createdAt: Date;
}

const LibrarySchema = new Schema<ILibrary>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  totalSeats: { type: Number, required: true, default: 50 },
  seatSections: [{
    prefix: { type: String, required: true },
    count: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Library || mongoose.model<ILibrary>('Library', LibrarySchema);
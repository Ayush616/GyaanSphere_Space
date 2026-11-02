import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatSection {
  prefix: string;
  count: number;
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
  seatSections: ISeatSection[];
  latitude: number;
  longitude: number;
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
  totalSeats: { type: Number, required: true, default: 30 },
  seatSections: [{
    prefix: { type: String, required: true },
    count: { type: Number, required: true }
  }],
    latitude: { type: Number },
  longitude: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Library || mongoose.model<ILibrary>('Library', LibrarySchema);
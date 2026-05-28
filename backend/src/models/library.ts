import mongoose, { Schema, Document } from 'mongoose';

export interface ILibraryItem extends Document {
  ownerId: string;
  name: string;
  filename?: string;
  content?: string; // stored as base64 or text
  mimeType?: string;
  createdAt: Date;
}

const LibrarySchema = new Schema<ILibraryItem>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    filename: { type: String },
    mimeType: { type: String },
    content: { type: String },
  },
  { timestamps: true }
);

export const LibraryItem = mongoose.model<ILibraryItem>('LibraryItem', LibrarySchema);

export default LibraryItem;

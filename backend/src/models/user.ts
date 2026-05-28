import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  schoolName?: string;
  passwordHash?: string;
  googleId?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    schoolName: { type: String },
    passwordHash: { type: String },
    googleId: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

export default User;

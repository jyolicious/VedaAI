import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user';

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function makeToken(userId: string) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  const { email, password, name, schoolName } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'User exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, schoolName, passwordHash });
  const token = makeToken(user._id.toString());
  res.json({ token, user: { id: user._id, email: user.email, name: user.name, schoolName: user.schoolName } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = makeToken(user._id.toString());
  res.json({ token, user: { id: user._id, email: user.email, name: user.name, schoolName: user.schoolName } });
});

router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Missing idToken' });

  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ message: 'Invalid Google token' });

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({ email: payload.email, name: payload.name || payload.email, googleId: payload.sub });
    }

    const token = makeToken(user._id.toString());
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, schoolName: user.schoolName } });
  } catch (err) {
    console.error('Google auth verify failed', err);
    res.status(400).json({ message: 'Google verification failed' });
  }
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Missing email' });

  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true });

  const token = crypto.randomBytes(24).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  console.log('Password reset link (log only):', resetLink);

  res.json({ ok: true });
});

router.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Missing fields' });

  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: 'Invalid token' });

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ ok: true });
});

export default router;

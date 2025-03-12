import { Request, Response } from 'express';
import User from '../models/User';
import otpGenerator from 'otp-generator';
import { sendOTPEmail } from '../config/mail';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateVerificationCode, storeVerificationCode, getVerificationCode, removeVerificationCode } from '../utils/verification';
import { sendSMS, verifyPhoneNumberExists } from '../lib/smsService';
import { verifyFirebaseToken } from '../services/firebaseService';
import { setAsync as redisSet, getAsync as redisGet, delAsync as redisDel } from '../lib/redis';

// Store OTPs with expiration (using Redis)
const OTP_EXPIRATION = 10 * 60; // 10 minutes in seconds

/**
 * Request OTP
 * Generates a 6-digit OTP, stores it in Redis, and sends it via email.
 */
export const generateOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    const otp = otpGenerator.generate(6, { 
      digits: true, 
      lowerCaseAlphabets: false, 
      upperCaseAlphabets: false, 
      specialChars: false 
    });
    await redisSet(`otp:${email}`, otp, OTP_EXPIRATION);
    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(`Error generating OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Failed to generate OTP' });
  }
};

/**
 * Verify OTP
 * Checks the OTP stored in Redis and verifies the user.
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }
    const storedOTP = await redisGet(`otp:${email}`);
    if (!storedOTP || storedOTP !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }
    await redisDel(`otp:${email}`);
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        isVerified: true,
      });
    } else {
      user.isVerified = true;
      await user.save();
    }
    res.status(200).json({ 
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error(`Error verifying OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

/**
 * Register a new user.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    const userExists = await User.findOne({ 
      $or: [
        { email },
        { phoneNumber }
      ] 
    });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isPhoneVerified: false,
      isVerified: false
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isPhoneVerified: user.isPhoneVerified,
      isVerified: user.isVerified,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login user.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isPhoneVerified: user.isPhoneVerified,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send phone verification code.
 */
export const sendPhoneVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      res.json({ 
        message: 'For production, please use Firebase client SDK for phone verification',
        useFirebaseClient: true
      });
      return;
    }
    const verificationCode = generateVerificationCode();
    const verificationId = await storeVerificationCode(phoneNumber, verificationCode, OTP_EXPIRATION);
    const smsSent = await sendSMS(
      phoneNumber,
      `Your Radeo Shop verification code is: ${verificationCode}. It expires in 10 minutes.`
    );
    if (smsSent) {
      res.json({ 
        message: 'Verification code sent successfully',
        verificationId
      });
    } else {
      res.status(500).json({ message: 'Failed to send SMS' });
    }
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
};

/**
 * Verify phone verification code.
 */
export const verifyPhoneCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, verificationId, verificationCode } = req.body;
    if (!phoneNumber || !verificationId || !verificationCode) {
      res.status(400).json({ message: 'Phone number, verification ID, and code are required' });
      return;
    }
    const storedCode = await getVerificationCode(verificationId);
    if (!storedCode) {
      res.status(400).json({ message: 'Verification code expired or invalid' });
      return;
    }
    if (storedCode !== verificationCode) {
      res.status(400).json({ message: 'Invalid verification code' });
      return;
    }
    await removeVerificationCode(verificationId);
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({
        phoneNumber,
        isPhoneVerified: true,
        name: `User-${phoneNumber.slice(-4)}`,
        role: 'user'
      });
    } else {
      user.isPhoneVerified = true;
      await user.save();
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    res.json({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isPhoneVerified: user.isPhoneVerified,
      token
    });
  } catch (error) {
    console.error('Verify phone code error:', error);
    res.status(500).json({ message: 'Failed to verify code' });
  }
};

/**
 * Verify Firebase phone authentication token and handle user.
 */
export const verifyFirebasePhoneAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ message: 'Firebase ID token is required' });
      return;
    }
    const decodedToken = await verifyFirebaseToken(idToken);
    if (!decodedToken) {
      res.status(401).json({ message: 'Invalid Firebase token' });
      return;
    }
    if (!decodedToken.phone_number) {
      res.status(400).json({ message: 'No phone number associated with token' });
      return;
    }
    let user = await User.findOne({ phoneNumber: decodedToken.phone_number });
    if (!user) {
      user = await User.create({
        name: `User-${decodedToken.uid.substring(0, 8)}`,
        phoneNumber: decodedToken.phone_number,
        isPhoneVerified: true,
        role: 'user',
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
      });
    } else {
      user.isPhoneVerified = true;
      await user.save();
    }
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    res.json({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      isPhoneVerified: user.isPhoneVerified,
      isVerified: user.isVerified,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Firebase phone authentication error:', error);
    res.status(500).json({ message: 'Server error during phone authentication' });
  }
};

/**
 * Get user profile.
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile.
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const { name, email, password, phoneNumber } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      isPhoneVerified: updatedUser.isPhoneVerified
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

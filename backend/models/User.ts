import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email?: string; // Made optional
  password: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  isVerified?: boolean;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: function (this: { email?: string }): boolean {
        // Password is required if email is provided
        return !!this.email;
      },
      minlength: 6
    },
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

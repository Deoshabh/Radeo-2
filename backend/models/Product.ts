import mongoose from 'mongoose';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  imageUrl: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    category: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0
    },
    rating: {
      type: Number,
      required: true,
      default: 0
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product; 
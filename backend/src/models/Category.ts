import mongoose from 'mongoose';

export interface ICategory {
  name: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category; 
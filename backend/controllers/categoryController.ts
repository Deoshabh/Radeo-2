import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    
    // Get product count for each category
    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category.name });
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl,
          productCount,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        };
      })
    );
    
    res.json(categoriesWithProductCount);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get product count for the category
    const productCount = await Product.countDocuments({ category: category.name });
    
    res.json({
      _id: category._id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new category (admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    // Check if category already exists
    const categoryExists = await Category.findOne({ name });
    
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    // Create new category
    const category = await Category.create({
      name,
      description,
      imageUrl
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a category (admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new name already exists (if name is being changed)
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      
      if (categoryExists) {
        return res.status(400).json({ message: 'Category with that name already exists' });
      }
    }
    
    // Update category fields
    category.name = name || category.name;
    category.description = description || category.description;
    category.imageUrl = imageUrl || category.imageUrl;
    
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a category (admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if there are products using this category
    const productsWithCategory = await Product.countDocuments({ category: category.name });
    
    if (productsWithCategory > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productsWithCategory} products are using this category.` 
      });
    }
    
    await category.deleteOne();
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
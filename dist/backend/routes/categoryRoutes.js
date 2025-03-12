import Category from '../models/Category'; // Adjust this import to match your Category model's path
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
import express from 'express';
const router = express.Router();
// Define your routes here
// For example:
router.get('/', (req, res) => {
    res.send('Categories list');
});
// Add other route handlers as needed
export default router;

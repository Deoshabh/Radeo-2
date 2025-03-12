"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
// Get all categories
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.find({}).sort({ name: 1 });
        // Get product count for each category
        const categoriesWithProductCount = yield Promise.all(categories.map((category) => __awaiter(void 0, void 0, void 0, function* () {
            const productCount = yield Product_1.default.countDocuments({ category: category.name });
            return {
                _id: category._id,
                name: category.name,
                description: category.description,
                imageUrl: category.imageUrl,
                productCount,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            };
        })));
        res.json(categoriesWithProductCount);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategories = getCategories;
// Get category by ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Get product count for the category
        const productCount = yield Product_1.default.countDocuments({ category: category.name });
        res.json({
            _id: category._id,
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl,
            productCount,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        });
    }
    catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategoryById = getCategoryById;
// Create a new category (admin only)
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, imageUrl } = req.body;
        // Check if category already exists
        const categoryExists = yield Category_1.default.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        // Create new category
        const category = yield Category_1.default.create({
            name,
            description,
            imageUrl
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createCategory = createCategory;
// Update a category (admin only)
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, imageUrl } = req.body;
        const category = yield Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Check if new name already exists (if name is being changed)
        if (name && name !== category.name) {
            const categoryExists = yield Category_1.default.findOne({ name });
            if (categoryExists) {
                return res.status(400).json({ message: 'Category with that name already exists' });
            }
        }
        // Update category fields
        category.name = name || category.name;
        category.description = description || category.description;
        category.imageUrl = imageUrl || category.imageUrl;
        const updatedCategory = yield category.save();
        res.json(updatedCategory);
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateCategory = updateCategory;
// Delete a category (admin only)
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Check if there are products using this category
        const productsWithCategory = yield Product_1.default.countDocuments({ category: category.name });
        if (productsWithCategory > 0) {
            return res.status(400).json({
                message: `Cannot delete category. ${productsWithCategory} products are using this category.`
            });
        }
        yield category.deleteOne();
        res.json({ message: 'Category removed' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteCategory = deleteCategory;

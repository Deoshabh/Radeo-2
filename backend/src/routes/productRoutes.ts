import express from 'express';
const router = express.Router();

// Define your product routes here
router.get('/', (req, res) => {
    // Here you can fetch your products from a database or use static data
    const products = [
      { id: 'prod-1', name: 'Stylish Hoodie', price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85', category: 'Clothing' },
      { id: 'prod-2', name: 'Wireless Headphones', price: 199.99, imageUrl: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85', category: 'Electronics' },
      { id: 'prod-3', name: 'Premium Watch', price: 299.99, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', category: 'Accessories' },
      { id: 'prod-4', name: 'Running Shoes', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', category: 'Footwear' }
    ];
    res.json({ message: 'Products fetched successfully', products });
  });
  

export default router; 
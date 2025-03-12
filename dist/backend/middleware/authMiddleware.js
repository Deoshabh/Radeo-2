import jwt from 'jsonwebtoken';
import User from '../models/User';
// Middleware to protect routes that require authentication
export const protect = async (req, res, next) => {
    let token;
    // Check if token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            // Get user from the token
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            // Add user to request object
            // @ts-ignore - adding user to req
            req.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            next();
        }
        catch (error) {
            console.error('Auth error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
// Middleware to restrict routes to admin users
export const admin = (req, res, next) => {
    // @ts-ignore - req.user is added by protect middleware
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

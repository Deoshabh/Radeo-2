"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Health check route
router.get('/health', (req, res) => {
    res.json({ message: 'Backend API Status: Online' });
});
// Request OTP route
router.post('/request-otp', authController_1.generateOTP);
// Add more routes as needed
exports.default = router;

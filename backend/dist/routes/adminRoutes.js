"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Protect all routes in this router with authentication and admin check
router.use(authMiddleware_1.protect); // Authentication check
router.use(authMiddleware_1.admin); // Admin role check
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Admin Panel' });
});
exports.default = router;

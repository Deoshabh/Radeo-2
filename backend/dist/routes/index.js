"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Define your routes
router.get('/example', (req, res) => {
    res.json({ message: 'Example route' });
});
// Make sure to export the router (not an object containing the router)
exports.default = router;
// If you want to export multiple routers, use named exports:
// export const userRouter = Router();
// export const productRouter = Router();

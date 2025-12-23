import express from 'express';
import { loginUser, seedData, getProfile, updateProfile, changePassword } from '../controllers/auth.controller.js';
// Kiểm tra kỹ tên file middleware của bạn là 'authMiddleware.js' hay 'auth.middleware.js' nhé!
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/login', loginUser);
router.post('/seed', seedData); // Đã mở, nhớ qua Postman bấm Send để chạy!

// --- XÓA ĐOẠN ROUTE TEST Ở ĐÂY ĐI ---

// Chỉ giữ lại các Route thật:
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
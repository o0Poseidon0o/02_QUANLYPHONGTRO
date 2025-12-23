import express from 'express';
import { getTenants, createTenant, updateTenant, deleteTenant,resetPassword } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tất cả các route này đều cần login (protect)
router.get('/', protect, getTenants);
router.post('/', protect, createTenant);
router.put('/:id', protect, updateTenant);
router.delete('/:id', protect, deleteTenant);
router.put('/:id/reset-password', protect, resetPassword);

export default router;
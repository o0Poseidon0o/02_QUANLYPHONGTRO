import express from 'express';
import { getMyContract, getContractById, createContract } from '../controllers/contract.controller.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// 1. Route xem hợp đồng của chính mình
router.get('/my-contract', protect, getMyContract);

// 2. Route tạo hợp đồng (Admin dùng) - Tạm mở để test
router.post('/', createContract); 

// 3. Route xem chi tiết theo ID
router.get('/:id', protect, getContractById);

export default router;
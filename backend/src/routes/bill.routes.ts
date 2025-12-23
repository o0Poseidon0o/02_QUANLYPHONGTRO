import express from 'express';
import { getBills,createBill,updateBillStatus,deleteBill,getMyBills } from '../controllers/bill.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/my-bills', protect, getMyBills);
// Tất cả các route này đều cần login (protect)
router.get('/', protect, getBills);
router.post('/', protect, createBill);
router.put('/:id', protect, updateBillStatus);
router.delete('/:id', protect, deleteBill);


export default router;
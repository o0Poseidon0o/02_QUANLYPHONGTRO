import express from 'express';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../controllers/room.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);

export default router;
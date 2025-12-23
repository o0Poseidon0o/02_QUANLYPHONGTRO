import type { Request, Response } from 'express';
import Room from '../models/Room.js';
import User from '../models/Users.js'; 

// GET: Lấy danh sách phòng
export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find().sort({ floor: 1, name: 1 });
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Thêm phòng mới
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, floor, area_m2, base_price, status, facilities } = req.body;
    
    const exists = await Room.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Tên phòng đã tồn tại' });

    const newRoom = new Room({
      name,
      floor,
      area_m2,
      base_price,
      status: status || 'AVAILABLE',
      facilities: Array.isArray(facilities) ? facilities : facilities.split(',').map((f: string) => f.trim()),
      images: []
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Cập nhật phòng
export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { name, floor, area_m2, base_price, status, facilities } = req.body;
    const room = await Room.findById(req.params.id);

    if (room) {
      room.name = name || room.name;
      room.floor = floor || room.floor;
      room.area_m2 = area_m2 || room.area_m2;
      room.base_price = base_price || room.base_price;
      room.status = status || room.status;
      
      if (facilities) {
         room.facilities = Array.isArray(facilities) ? facilities : facilities.split(',').map((f: string) => f.trim());
      }

      const updatedRoom = await room.save();
      res.json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Xóa phòng - ĐÃ SỬA LỖI TYPESCRIPT
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);

    if (room) {
      // SỬA LỖI Ở ĐÂY: Thêm 'as any' vào object filter để Typescript không báo lỗi
      await User.updateMany({ roomId: roomId as any }, { $set: { roomId: null } });

      await room.deleteOne();
      res.json({ message: 'Đã xóa phòng và cập nhật trạng thái cư dân liên quan.' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
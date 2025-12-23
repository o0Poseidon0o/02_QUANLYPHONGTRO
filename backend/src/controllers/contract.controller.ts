import type { Request, Response } from "express";
import Contract from "../models/Contract.js";

import User from '../models/Users.js'; 
import Room from '../models/Room.js';

// GET: Lấy hợp đồng CỦA CHÍNH TÔI (Dành cho Tenant xem)
export const getMyContract = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    // Tìm hợp đồng đang ACTIVE
    const contract = await Contract.findOne({
      tenant_id: userId,
      status: "ACTIVE",
    })
      .populate("room_id", "name floor area_m2 facilities base_price") 
      .populate("tenant_id", "full_name phone cccd"); 

    if (!contract) {
      return res.json(null);
    }

    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET: Lấy chi tiết theo ID (Admin)
export const getContractById = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("room_id")
      .populate("tenant_id", "-password_hash");

    if (!contract)
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });

    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Admin lập hợp đồng mới (AUTO LINK USER & ROOM)
export const createContract = async (req: Request, res: Response) => {
  try {
    const { room_id, tenant_id, start_date, duration_months, deposit_amount, rental_price } = req.body;

    // 1. Tính ngày kết thúc
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (duration_months || 12)); 

    // 2. Tạo Hợp đồng mới
    const newContract = new Contract({
      room_id,
      tenant_id,
      start_date: startDate,
      end_date: endDate,
      deposit_amount: deposit_amount || 0,
      rental_price: rental_price || 0,
      status: 'ACTIVE'
    });

    // 3. Cập nhật trạng thái Phòng -> RENTED
    const updateRoom = Room.findByIdAndUpdate(room_id, { 
        status: 'RENTED' 
    });

    // 4. Cập nhật User -> Gán roomId để hiển thị nhanh (dự phòng)
    const updateUser = User.findByIdAndUpdate(tenant_id, { 
        roomId: room_id 
    });

    // Chạy song song 3 tác vụ
    await Promise.all([newContract.save(), updateRoom, updateUser]);

    res.status(201).json({ 
        message: 'Lập hợp đồng thành công!', 
        contract: newContract 
    });

  } catch (error: any) {
    console.error("Lỗi createContract:", error);
    res.status(500).json({ message: error.message });
  }
};
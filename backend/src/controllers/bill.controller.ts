import type { Request, Response } from "express";
import Bill from "../models/Bill.js";
import User from "../models/Users.js";
import "../models/Room.js"; // Import để đăng ký model Room

// GET: Lấy danh sách hóa đơn
export const getBills = async (req: Request, res: Response) => {
  try {
    const bills = await Bill.find()
      .populate("tenantId", "full_name username phone")
      .populate("roomId", "name")
      .sort({ year: -1, month: -1, created_at: -1 });
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Tạo hóa đơn mới
export const createBill = async (req: Request, res: Response) => {
  try {
    // 1. Lấy thêm elec_price, water_price từ client gửi lên
    const {
      tenantId,
      month,
      year,
      elec_old,
      elec_new,
      elec_price,
      water_old,
      water_new,
      water_price,
      service_fee,
      other_fee,
    } = req.body;

    const user = await User.findById(tenantId).populate("roomId");
    if (!user || !user.roomId) {
      return res
        .status(400)
        .json({ message: "Người dùng không tồn tại hoặc chưa được gán phòng" });
    }

    const room: any = user.roomId;

    // 2. Xử lý giá điện/nước: Ưu tiên lấy từ Body, nếu không có thì lấy mặc định
    const final_elec_price = elec_price ? Number(elec_price) : 3500;
    const final_water_price = water_price ? Number(water_price) : 20000;

    // 3. Tính toán tiền dựa trên giá mới
    const elec_cost = (elec_new - elec_old) * final_elec_price;
    const water_cost = (water_new - water_old) * final_water_price;

    // Tổng tiền
    const total =
      room.base_price +
      elec_cost +
      water_cost +
      Number(service_fee) +
      Number(other_fee);

    // 4. Lưu vào Database
    const newBill = new Bill({
      tenantId: user._id,
      roomId: room._id,
      month,
      year,
      elec_old,
      elec_new,
      elec_price: final_elec_price, // Lưu giá thực tế đã dùng để tính
      water_old,
      water_new,
      water_price: final_water_price, // Lưu giá thực tế
      room_price: room.base_price,
      service_fee,
      other_fee,
      total_amount: total,
      is_paid: false,
    });

    await newBill.save();
    res.status(201).json(newBill);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Cập nhật trạng thái thanh toán
export const updateBillStatus = async (req: Request, res: Response) => {
  try {
    const { is_paid } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (bill) {
      bill.is_paid = is_paid;
      await bill.save();
      res.json(bill);
    } else {
      res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Xóa hóa đơn
export const deleteBill = async (req: Request, res: Response) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa hóa đơn" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getMyBills = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const bills = await Bill.find({ tenantId: userId })
      .populate("roomId", "name")
      .sort({ year: -1, month: -1 });

    res.json(bills);
  } catch (error: any) {
    console.error("❌ Lỗi:", error);
    res.status(500).json({ message: error.message });
  }
};

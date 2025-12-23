import type { Request, Response } from 'express';
import Room from '../models/Room.js';
import Bill from '../models/Bill.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Chạy song song các câu lệnh query để tiết kiệm thời gian
    const [
      totalRooms,
      emptyRooms,
      pendingBillsCount,
      revenueData,
      pendingBillsData
    ] = await Promise.all([
      // 1. Tổng số phòng
      Room.countDocuments(),
      
      // 2. Số phòng trống
      Room.countDocuments({ status: 'AVAILABLE' }),
      
      // 3. Số hóa đơn chưa thanh toán
      Bill.countDocuments({ is_paid: false }),
      
      // 4. Tính tổng doanh thu (Đã thanh toán)
      Bill.aggregate([
        { $match: { is_paid: true } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
      ]),

      // 5. Tính tổng tiền đang nợ (Chưa thanh toán)
      Bill.aggregate([
        { $match: { is_paid: false } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
      ])
    ]);

    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;
    const pendingAmount = pendingBillsData.length > 0 ? pendingBillsData[0].total : 0;

    res.json({
      totalRooms,
      emptyRooms,
      rentedRooms: totalRooms - emptyRooms,
      pendingBills: pendingBillsCount,
      pendingAmount, // Tổng tiền nợ
      revenue        // Tổng tiền đã thu
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
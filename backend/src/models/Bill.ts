import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  tenantId: mongoose.Types.ObjectId; // Người thuê
  roomId: mongoose.Types.ObjectId;   // Phòng
  month: number;
  year: number;
  
  // Điện
  elec_old: number;
  elec_new: number;
  elec_price: number; // Giá điện tại thời điểm tạo bill
  
  // Nước
  water_old: number;
  water_new: number;
  water_price: number; // Giá nước
  
  room_price: number; // Tiền phòng gốc
  service_fee: number; // Rác, wifi, vệ sinh...
  other_fee: number;   // Phạt, hoặc thu thêm
  
  total_amount: number; // Tổng tiền phải trả
  is_paid: boolean;
  
  created_at: Date;
}

const BillSchema: Schema = new Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  
  elec_old: { type: Number, required: true },
  elec_new: { type: Number, required: true },
  elec_price: { type: Number, default: 3500 }, // Ví dụ 3.5k/số
  
  water_old: { type: Number, required: true },
  water_new: { type: Number, required: true },
  water_price: { type: Number, default: 20000 }, // Ví dụ 20k/khối
  
  room_price: { type: Number, required: true },
  service_fee: { type: Number, default: 0 },
  other_fee: { type: Number, default: 0 },
  
  total_amount: { type: Number, required: true },
  is_paid: { type: Boolean, default: false },
  
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IBill>('Bill', BillSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  floor: number;
  area_m2: number;
  base_price: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'; 
  facilities: string[];
  current_contract_id?: mongoose.Types.ObjectId;
  images: string[];
}

const RoomSchema: Schema = new Schema({
  name: { type: String, required: true },
  floor: { type: Number, required: true },
  area_m2: { type: Number },
  base_price: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE'], default: 'AVAILABLE' },
  facilities: [{ type: String }],
  current_contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },
  images: [{ type: String }]
});

export default mongoose.model<IRoom>('Room', RoomSchema);
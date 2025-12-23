import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  room_id: mongoose.Types.ObjectId;
  tenant_id: mongoose.Types.ObjectId;
  start_date: Date;
  end_date: Date;
  rental_price: number;
  deposit_amount: number;
  number_of_tenants: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  service_ids: mongoose.Types.ObjectId[];
}

const ContractSchema: Schema = new Schema({
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  rental_price: { type: Number, required: true },
  deposit_amount: { type: Number, required: true },
  number_of_tenants: { type: Number, default: 1 },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'TERMINATED'], default: 'ACTIVE' },
  service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }]
});

export default mongoose.model<IContract>('Contract', ContractSchema);
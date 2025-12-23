import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  unit: string; // VD: kWh, m3, tháng, người
  price: number;
  type: 'METER' | 'FIXED'; // METER (theo đồng hồ), FIXED (cố định)
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['METER', 'FIXED'], default: 'METER' }
});

export default mongoose.model<IService>('Service', ServiceSchema);
import mongoose, { Schema, Document } from "mongoose";

// 1. Cập nhật Interface TypeScript (Để Controller không báo lỗi đỏ)
export interface IUser extends Document {
  username: string;
  password_hash: string;
  full_name: string;
  phone: string;
  role: "ADMIN" | "TENANT";
  roomId?: mongoose.Types.ObjectId | undefined;

  // --- CÁC TRƯỜNG MỚI THÊM ---
  email?: string | undefined;
  cccd?:
    | {
        number: string;
        images: string[];
      }
    | undefined;
  address_permanent?: string | undefined;

  created_at: Date;
}

// 2. Cập nhật Mongoose Schema (Để lưu được vào Database)
const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "TENANT"], default: "TENANT" },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    // --- CÁC TRƯỜNG MỚI THÊM ---
    email: { type: String, default: "" },
    cccd: {
      number: { type: String, default: "" },
      images: [{ type: String }],
    },
    address_permanent: { type: String, default: "" },

    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);

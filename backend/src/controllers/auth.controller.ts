import type { Request, Response } from 'express';
import User from '../models/Users.js'; 
import Room from '../models/Room.js'; 
import Contract from '../models/Contract.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// --- 1. LOGIN ---
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        _id: user._id, 
        username: user.username,
        full_name: user.full_name, 
        role: user.role,
        token: generateToken(user._id.toString(), user.role), 
      });
    } else {
      res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. TẠO DỮ LIỆU MẪU (SEED) ---
export const seedData = async (req: Request, res: Response) => {
  try {
    // 1. Xóa sạch dữ liệu cũ
    await User.deleteMany({}); 
    await Room.deleteMany({});
    await Contract.deleteMany({});
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 2. TẠO PHÒNG MỚI
    const room301 = new Room({
        name: 'Phòng 301 (VIP)',
        floor: 3, area_m2: 45, base_price: 4500000, status: 'RENTED',
        facilities: ['Điều hòa', 'Nóng lạnh', 'Tủ lạnh'], images: []
    });
    await room301.save();

    // 3. TẠO USER (TENANT)
    const tenant = new User({
        username: 'nguyenvana',
        password_hash: hashedPassword,
        full_name: 'Nguyễn Văn A',
        phone: '0987654321', // Tenant đã có phone -> OK
        email: 'vana@email.com',
        role: 'TENANT',
        cccd: { number: '001090000001', images: [] },
        address_permanent: 'Hà Nội',
        roomId: room301._id 
    });
    await tenant.save();

    // 4. TẠO USER (ADMIN) - SỬA LỖI TẠI ĐÂY
    const admin = new User({
        username: 'admin',
        password_hash: hashedPassword,
        full_name: 'Quản Trị Viên',
        phone: '0900000000', // <--- THÊM DÒNG NÀY ĐỂ FIX LỖI
        role: 'ADMIN',
        roomId: null 
    });
    await admin.save();

    // 5. TẠO HỢP ĐỒNG
    const newContract = new Contract({
        room_id: room301._id,
        tenant_id: tenant._id,
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        rental_price: 4200000,
        deposit_amount: 4000000,
        status: 'ACTIVE'
    });
    await newContract.save();

    res.json({ message: 'Seed thành công: Đã sửa lỗi thiếu Phone cho Admin.' });
    
  } catch (error: any) { 
    res.status(500).json({ message: error.message });
  }
};

// --- 3. GET PROFILE (Đã rút gọn, chỉ trả về User) ---
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    // Populate roomId để lấy thông tin phòng cơ bản
    const user = await User.findById(userId)
      .select('-password_hash')
      .populate('roomId', 'name area_m2'); // Thêm dòng này

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // API contract riêng sẽ lo phần hợp đồng, ở đây chỉ trả về user
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. UPDATE PROFILE ---
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { full_name, phone, email, cccd, address_permanent } = req.body;
    const user = await User.findById(userId);
    
    if (user) {
      user.full_name = full_name || user.full_name;
      user.phone = phone || user.phone;
      user.email = email || user.email;
      user.address_permanent = address_permanent || user.address_permanent;
      if (cccd) user.cccd = { number: cccd, images: user.cccd?.images || [] };

      const updatedUser = await user.save();
      const userResponse = updatedUser.toObject();
      delete (userResponse as any).password_hash;
      res.json(userResponse);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. CHANGE PASSWORD ---
export const changePassword = async (req: Request, res: Response) => {
    // (Giữ nguyên logic cũ của bạn)
    try {
        const userId = (req as any).user._id;
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
    
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Đổi mật khẩu thành công!' });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
};
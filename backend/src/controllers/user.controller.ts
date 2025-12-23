import type { Request, Response } from 'express';
// SỬA QUAN TRỌNG: Đổi Users.js thành User.js (Bỏ chữ 's' cho đúng tên file model)
import User from '../models/Users.js'; 
import bcrypt from 'bcryptjs';
import '../models/Room.js'; // Import để Mongoose đăng ký model Room trước khi populate

// GET: Lấy danh sách cư dân (Chỉ lấy role TENANT)
export const getTenants = async (req: Request, res: Response) => {
  try {
    // Populate thêm base_price để tính tiền hóa đơn
    const tenants = await User.find({ role: 'TENANT' })
      .populate('roomId', 'name base_price') 
      .sort({ createdAt: -1 });
      
    res.json(tenants);
  } catch (error: any) {
    console.error("Lỗi getTenants:", error); // Log lỗi ra terminal để dễ debug
    res.status(500).json({ message: error.message });
  }
};

// POST: Tạo cư dân mới
export const createTenant = async (req: Request, res: Response) => {
  try {
    const { username, password, full_name, phone, roomId, email, cccd, address_permanent } = req.body;
    
    // 1. Kiểm tra trùng user
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Tạo User mới
    const newUser = new User({
      username,
      password_hash,
      full_name,
      phone,
      role: 'TENANT',
      // Nếu roomId là rỗng (string rỗng) thì gán là null để không bị lỗi CastObjectId
      roomId: roomId || null, 
      email: email || '', 
      // Xử lý CCCD: Nếu không có thì tạo object rỗng an toàn
      cccd: { number: cccd || '', images: [] },
      address_permanent: address_permanent || ''
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Lỗi createTenant:", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT: Cập nhật thông tin
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { full_name, phone, roomId, email, cccd, address_permanent } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.full_name = full_name || user.full_name;
      user.phone = phone || user.phone;
      
      // Xử lý RoomId: Nếu client gửi chuỗi rỗng "" nghĩa là muốn rời phòng
      if (roomId === "") {
        user.roomId = undefined; // Hoặc null tùy vào cấu hình Mongoose, undefined an toàn hơn cho optional
      } else if (roomId) {
        user.roomId = roomId;
      }

      if (email !== undefined) user.email = email;
      if (address_permanent !== undefined) user.address_permanent = address_permanent;
      
      // Xử lý cập nhật CCCD mà không mất ảnh cũ
      if (cccd !== undefined) {
        user.cccd = {
          number: cccd,
          images: user.cccd?.images || [] // Giữ lại ảnh cũ nếu có
        };
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error: any) {
    console.error("Lỗi updateTenant:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Xóa cư dân
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'Đã xóa cư dân' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Reset mật khẩu về mặc định (123456)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    user.password_hash = hashedPassword;
    await user.save();

    res.json({ message: 'Đã reset mật khẩu thành công về: 123456' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
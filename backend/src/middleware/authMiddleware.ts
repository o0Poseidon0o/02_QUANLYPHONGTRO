import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // 2. [FIX QUAN TRỌNG] Tạo biến secret riêng để đảm bảo luôn là String
      // Nếu không tìm thấy env (lúc build docker), nó sẽ dùng chuỗi 'fallback_secret'
      const secretKey = process.env.JWT_SECRET || 'fallback_secret';

      // 3. [FIX QUAN TRỌNG] Ép kiểu 2 lần (Double Casting) cho kết quả trả về
      // jwt.verify trả về string | JwtPayload, ta ép về object có id
      const decoded = jwt.verify(token, secretKey) as unknown as { id: string; role: string };

      // 4. Tìm user từ ID đã giải mã
      req.user = await User.findById(decoded.id).select('-password_hash');

      next();
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

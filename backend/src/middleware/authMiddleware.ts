import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // --- SỬA LỖI TẠI ĐÂY: Dùng Double Casting (as unknown as ...) ---
      const secretKey = process.env.JWT_SECRET || 'secret';
      
      // Ép kiểu sang unknown trước để TypeScript không báo lỗi overlapping
      const decoded = jwt.verify(token, secretKey) as unknown as { id: string; role: string };

      // Tìm user và gắn vào request
      req.user = await User.findById(decoded.id).select('-password_hash');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

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
      token = req.headers.authorization.split(' ')[1];

      // --- SỬA LỖI TẠI ĐÂY ---
      // Dùng "as any" để ép TypeScript im lặng, chấp nhận mọi kiểu dữ liệu
      const secret = process.env.JWT_SECRET as any; 
      
      const decoded = jwt.verify(token, secret) as any;
      // -----------------------

      req.user = await User.findById(decoded.id).select('-password_hash');

      next();
    } catch (error) {
      console.error("Lỗi token:", error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

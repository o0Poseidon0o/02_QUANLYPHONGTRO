import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import User from '../models/Users.js';

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as unknown as DecodedToken;

      // --- SỬA Ở ĐÂY: Tìm user và gán vào req.user ---
      const user = await User.findById(decoded.id).select('-password_hash');
      
      if (!user) {
        return res.status(401).json({ message: 'Không tìm thấy người dùng' });
      }

      (req as any).user = user; // Gán user vào request
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Chưa đăng nhập, thiếu token' });
  }
};
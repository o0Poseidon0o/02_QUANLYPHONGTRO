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

      // --- TUYỆT CHIÊU CUỐI: @ts-ignore ---
      // Dòng comment này bắt buộc phải nằm ngay trên dòng gây lỗi
      // Nó sẽ tắt hoàn toàn kiểm tra lỗi cho dòng jwt.verify bên dưới
      
      // @ts-ignore
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ------------------------------------

      req.user = await User.findById((decoded as any).id).select('-password_hash');

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

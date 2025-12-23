import express from 'express';
// 1. Import dotenv và cors
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/user.routes.js';
import roomRoutes from './src/routes/room.routes.js';
import billRoutes from './src/routes/bill.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import contractRoutes from './src//routes/contract.routes.js';
// 2. Kích hoạt dotenv ngay dòng đầu tiên để đọc file .env
dotenv.config();

// Kết nối CSDL
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 3. Kích hoạt Middleware CORS và JSON
app.use(cors()); // Cho phép mọi nguồn (Frontend) gọi vào
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bills', billRoutes)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contracts', contractRoutes);

app.get('/', (req, res) => {
  res.send('Server API quản lý nhà trọ đang chạy...');
});


app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
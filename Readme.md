backend/
├── src/
│   ├── config/             # Cấu hình DB, Environment variables
│   │   └── db.ts           # Hàm kết nối MongoDB
│   ├── controllers/        # Xử lý logic nghiệp vụ
│   │   ├── auth.controller.ts  # Đăng ký, Đăng nhập
│   │   ├── bill.controller.ts  # Xem hóa đơn, tạo hóa đơn
│   │   └── user.controller.ts  # Quản lý người thuê (Admin only)
│   ├── middleware/         # Các hàm trung gian kiểm duyệt
│   │   ├── authMiddleware.ts   # Kiểm tra token đăng nhập
│   │   └── roleMiddleware.ts   # Kiểm tra xem có phải Admin không?
│   ├── models/             # Định nghĩa Schema MongoDB
│   │   ├── User.ts         # Schema User (role: 'admin' | 'tenant')
│   │   ├── Room.ts         # Schema Phòng
│   │   └── Bill.ts         # Schema Hóa đơn tháng
│   ├── routes/             # Định nghĩa API endpoints
│   │   ├── auth.routes.ts
│   │   ├── bill.routes.ts
│   │   └── index.ts
│   ├── utils/              # Các hàm tiện ích (xử lý lỗi, validate)
│   └── index.ts            # Entry point của server
├── .env                    # Chứa MONGO_URI, JWT_SECRET
├── package.json
└── tsconfig.json

npm init -y

# Cài đặt các thư viện chính (dependencies)
npm install express mongoose dotenv cors bcryptjs jsonwebtoken helmet morgan

# Cài đặt các thư viện hỗ trợ phát triển (dev dependencies)
npm install -D typescript ts-node nodemon @types/node @types/express @types/mongoose @types/cors @types/bcryptjs @types/jsonwebtoken @types/morgan

fontend/
├── src/
│   ├── api/                # Cấu hình Axios và gọi API xuống server
│   │   ├── axiosClient.ts
│   │   └── authApi.ts
│   ├── assets/             # Hình ảnh, fonts
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   ├── common/         # Button, Input, Modal, Loader
│   │   ├── layout/         # Header, Sidebar (cho Admin)
│   │   └── ProtectedRoute.tsx # Component chặn truy cập nếu chưa login
│   ├── context/            # Quản lý state toàn cục (AuthContext)
│   │   └── AuthContext.tsx # Lưu user info để biết ai đang đăng nhập
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Các trang màn hình chính
│   │   ├── Login.tsx       # Trang đăng nhập
│   │   ├── NotFound.tsx
│   │   ├── admin/          # Khu vực dành riêng cho Admin
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RoomManager.tsx
│   │   │   └── BillManager.tsx
│   │   └── tenant/         # Khu vực dành cho người thuê
│   │       └── MyBill.tsx  # Xem tiền phòng tháng này
│   ├── types/              # Định nghĩa các Interface TypeScript chung
│   ├── App.tsx             # Cấu hình Routing (phân luồng)
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
└── tsconfig.json

# Khởi tạo Vite với template React-TS
npm create vite@latest . -- --template react-ts

# Cài đặt thư viện cần thiết
npm install axios react-router-dom react-hook-form react-toastify

# Cài đặt Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
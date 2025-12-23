# Đổi từ 18-alpine sang 24-alpine
FROM node:24-alpine

WORKDIR /app

# Copy file package trước để tận dụng cache
COPY package*.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code
COPY . .

# --- SỬA LỖI TẠI ĐÂY ---
# KHÔNG DÙNG: RUN npm run dev (Vì nó sẽ treo build vĩnh viễn)
# DÙNG:
RUN npm run build
# -----------------------

# Mở cổng
EXPOSE 5000

# Lệnh này sẽ in ra cấu trúc thư mục dist để ta biết file nằm ở đâu
CMD ["sh", "-c", "echo '=== KIEM TRA THU MUC DIST ==='; ls -R /app/dist; echo '=== KET THUC KIEM TRA ==='; node dist/index.js"]

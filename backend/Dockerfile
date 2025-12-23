# 1. Môi trường
FROM node:18-alpine

# 2. Tạo thư mục làm việc trong Docker
WORKDIR /app

# 3. COPY package.json trước (Để tận dụng cache nếu không cài thêm thư viện mới)
COPY package*.json ./

# 4. Cài đặt thư viện
RUN npm install

# 5. COPY toàn bộ code nguồn vào (Trừ những thứ trong .dockerignore)
COPY . .

# 6. Build TypeScript sang JavaScript (Chạy lệnh build trong package.json)
RUN npm run build

# 7. Mở cổng
EXPOSE 5000

# 8. Chạy lệnh start (node dist/index.js)
CMD ["npm", "start"]
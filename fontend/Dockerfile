# --- Giai đoạn 1: Build React ---
FROM node:24-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- SỬA LỖI TẠI ĐÂY ---
# Code cũ (SAI): RUN npm run dev
# Code mới (ĐÚNG): Lệnh này sẽ tạo ra thư mục /app/dist chứa file html, css, js
RUN npm run build
# -----------------------

# --- Giai đoạn 2: Chạy Nginx ---
FROM nginx:alpine as production-stage

# Copy file build từ giai đoạn 1 vào Nginx
# Lệnh này chỉ hoạt động nếu bước trên chạy 'npm run build'
COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 89
CMD ["nginx", "-g", "daemon off;"]

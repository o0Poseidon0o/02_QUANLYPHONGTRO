# --- Giai đoạn 1: Build React ---
FROM node:24-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Lệnh build của Vite
RUN npm run build

# --- Giai đoạn 2: Chạy Nginx ---
FROM nginx:alpine as production-stage
# Copy file build từ giai đoạn 1 vào Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy file cấu hình Nginx mình vừa tạo ở trên
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 89
CMD ["nginx", "-g", "daemon off;"]

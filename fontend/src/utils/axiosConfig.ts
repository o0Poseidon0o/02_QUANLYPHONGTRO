// client/src/utils/axiosConfig.ts
import axios from 'axios';

// Lấy URL từ biến môi trường, nếu không có thì dùng localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động thêm Token vào mọi request nếu có
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../../utils/axiosConfig';

// --- INTERFACES ---
interface UserProfile {
  _id: string;
  username: string;
  full_name: string;
  phone: string;
  email: string;
  address_permanent: string;
  cccd: { number: string };
  role: string;
  created_at?: string;
  roomId?: {
    _id: string;
    name: string;
    area_m2: number;
  } | null;
}

interface ContractInfo {
  _id: string;
  rental_price: number;
  deposit_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  room_id: {
    _id: string;
    name: string;
    area_m2: number;
    facilities: string[];
  };
}

// [FIX 1] Định nghĩa kiểu cho Props của InfoRow
interface InfoRowProps {
  label: string;
  value?: string | number | null;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '', phone: '', email: '', address_permanent: '', cccd: ''
  });
  const [passData, setPassData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });

  // --- FETCH DATA ---
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Gọi song song 2 API
      const [userRes, contractRes] = await Promise.all([
        axiosClient.get<UserProfile>('/auth/profile', { headers }), // Thêm Generic Type <UserProfile>
        axiosClient.get<ContractInfo>('/contracts/my-contract', { headers })
      ]);

      const userData = userRes.data;
      const contractData = contractRes.data;

      setUser(userData);
      setContract(contractData);

      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        email: userData.email || '',
        address_permanent: userData.address_permanent || '',
        cccd: userData.cccd?.number || ''
      });

    } catch (error: unknown) { // [FIX 2] Sử dụng unknown thay vì any
      console.error("Lỗi tải dữ liệu:", error);
      
      // Kiểm tra xem lỗi có phải từ Axios không
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert('Phiên đăng nhập hết hạn.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // --- HANDLERS ---
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axiosClient.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cập nhật thành công!');
      fetchProfileData();
    } catch (error) { 
      console.error(error);
      alert('Lỗi cập nhật'); 
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) return alert('Mật khẩu không khớp');
    try {
      const token = localStorage.getItem('token');
      await axiosClient.put('/auth/change-password',
        { oldPassword: passData.oldPassword, newPassword: passData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Đổi mật khẩu thành công!');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) { // [FIX 3] Xử lý lỗi Axios chuẩn
      if (axios.isAxiosError(error)) {
        // Ép kiểu dữ liệu trả về từ lỗi (nếu backend trả về message)
        const errorMessage = (error.response?.data as { message: string })?.message || 'Lỗi hệ thống';
        alert(errorMessage);
      } else {
        alert('Lỗi không xác định');
      }
    }
  };

  // [FIX 4] Áp dụng interface InfoRowProps
  const InfoRow = ({ label, value }: InfoRowProps) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">{label}</p>
        <p className="text-sm font-medium mt-0.5 text-gray-900 dark:text-white">{value || 'Chưa cập nhật'}</p>
      </div>
    </div>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  };

  const formatDuration = (start: string, end: string) => {
    if (!start || !end) return '---';
    const d1 = new Date(start);
    const d2 = new Date(end);

    let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());

    if (d2.getDate() < d1.getDate()) {
      months--;
    }

    if (months <= 0) return "Dưới 1 tháng";

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let result = "";
    if (years > 0) result += `${years} Năm `;
    if (remainingMonths > 0) result += `${remainingMonths} Tháng`;

    return result.trim();
  };

  // --- RENDER CARD HỢP ĐỒNG ---
  const renderRoomOrContractInfo = () => {
    if (contract) {
      const daysLeft = Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;

      return (
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01] duration-300">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    Hợp đồng thuê
                  </span>
                  {isExpiringSoon ? (
                    <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                      Sắp hết hạn ({daysLeft} ngày)
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-400/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> {contract.status}
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-extrabold">{contract.room_id.name}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-indigo-200 mt-1">
                  <span>Diện tích: {contract.room_id.area_m2}m²</span>
                  <span>•</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded">
                    Thời hạn: <b>{formatDuration(contract.start_date, contract.end_date)}</b>
                  </span>
                </div>
              </div>
            </div>

            {contract.room_id.facilities && contract.room_id.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {contract.room_id.facilities.map((fac, idx) => (
                  <span key={idx} className="text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    {fac}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm border-t border-white/10 pt-4">
              <div>
                <span className="text-indigo-200 text-xs block mb-0.5">Ngày bắt đầu</span>
                <span className="font-semibold">{formatDate(contract.start_date)}</span>
              </div>
              <div className="text-right">
                <span className="text-indigo-200 text-xs block mb-0.5">Ngày hết hạn</span>
                <span className="font-semibold text-yellow-300">{formatDate(contract.end_date)}</span>
              </div>
              <div>
                <span className="text-indigo-200 text-xs block mb-0.5">Tiền cọc</span>
                <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.deposit_amount)}</span>
              </div>
              <div className="text-right">
                <span className="text-indigo-200 text-xs block mb-0.5">Giá thuê/tháng</span>
                <span className="font-bold text-lg text-white">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.rental_price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (user?.roomId) {
      return (
        <div className="bg-linear-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01] duration-300">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/20">Phòng hiện tại</span>
                  <span className="bg-yellow-500/20 text-yellow-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-400/30">
                    Chưa ký hợp đồng
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold">{user.roomId.name}</h3>
                <p className="text-xs text-blue-100 mt-1">Diện tích: {user.roomId.area_m2}m²</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-blue-100 italic">
                Bạn đã được xếp vào phòng này nhưng chưa có hợp đồng chính thức trên hệ thống.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-gray-300 dark:border-slate-600">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa được xếp phòng.</p>
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải hồ sơ...</div>;
  if (!user) return null;

  const avatarChar = (user.full_name || user.username || "U").charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Banner */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-6 pb-6">
          <div className="relative flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 p-1 shadow-lg border-4 border-white dark:border-slate-800 flex items-center justify-center text-3xl font-bold text-gray-500 uppercase">
              {avatarChar}
            </div>
            <div className="ml-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name || user.username}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">@{user.username} • <span className="uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">{user.role}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Trái */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-slate-700">Thông tin chung</h3>
            <InfoRow label="Tài khoản" value={user.username} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="CCCD" value={user.cccd?.number} />
            <InfoRow label="Địa chỉ" value={user.address_permanent} />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            {renderRoomOrContractInfo()}
          </div>
        </div>

        {/* Cột Phải: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Chỉnh sửa thông tin</h3>
            <form onSubmit={handleUpdateInfo} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <input name="full_name" value={formData.full_name} onChange={handleInfoChange} className="border p-2 rounded" placeholder="Họ tên" />
                <input name="phone" value={formData.phone} onChange={handleInfoChange} className="border p-2 rounded" placeholder="SĐT" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <input name="email" value={formData.email} onChange={handleInfoChange} className="border p-2 rounded" placeholder="Email" />
                <input name="cccd" value={formData.cccd} onChange={handleInfoChange} className="border p-2 rounded" placeholder="CCCD" />
              </div>
              <input name="address_permanent" value={formData.address_permanent} onChange={handleInfoChange} className="border p-2 rounded w-full" placeholder="Địa chỉ thường trú" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Lưu thay đổi</button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <input type="password" name="oldPassword" value={passData.oldPassword} onChange={handlePassChange} className="border p-2 rounded w-full" placeholder="Mật khẩu cũ" />
              <div className="grid grid-cols-2 gap-5">
                <input type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange} className="border p-2 rounded" placeholder="Mật khẩu mới" />
                <input type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePassChange} className="border p-2 rounded" placeholder="Xác nhận MK" />
              </div>
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded">Cập nhật mật khẩu</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
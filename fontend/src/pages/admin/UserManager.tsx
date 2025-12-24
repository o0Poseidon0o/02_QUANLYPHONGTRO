import React, { useState, useEffect } from 'react';
import axios from 'axios'; // [FIX 1] Import axios để check lỗi
import axiosClient from '../../utils/axiosConfig';

// Interface cho User
interface Tenant {
  _id: string;
  username: string;
  full_name: string;
  phone: string;
  roomId?: { _id: string; name: string; base_price?: number } | null;
  email?: string;
  address_permanent?: string;
  cccd?: {
    number: string;
    images: string[];
  };
}

// Interface cho Room
interface RoomOption {
  _id: string;
  name: string;
  status: string;
  base_price: number;
}

// [FIX 2] Interface cho Error Response từ Backend
interface ErrorResponse {
    message: string;
}

const UserManager = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(false);

  // --- STATE MODAL USER ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', phone: '', roomId: '',
    email: '', address_permanent: '', cccd: ''
  });

  // --- STATE MODAL HỢP ĐỒNG ---
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractForm, setContractForm] = useState({
    tenant_id: '',
    tenant_name: '',
    room_id: '',
    start_date: new Date().toISOString().split('T')[0], // Mặc định hôm nay
    duration_months: 12, // Mặc định 1 năm
    end_date_preview: '', // Để hiển thị cho admin xem trước
    rental_price: 0,
    deposit_amount: 0
  });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [usersRes, roomsRes] = await Promise.all([
        axiosClient.get('/users', { headers }),
        axiosClient.get('/rooms', { headers })
      ]);

      setTenants(usersRes.data);
      setRooms(roomsRes.data);
    } catch (error: unknown) { // [FIX 3] Dùng unknown
      console.error(error);
      alert('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPER: TÍNH NGÀY KẾT THÚC ---
  const calculateEndDate = (startDate: string, months: number) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + parseInt(months.toString()));
    return date.toLocaleDateString('vi-VN'); // Format dd/mm/yyyy
  };

  // --- HANDLERS USER ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (user?: Tenant) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username, password: '', full_name: user.full_name, phone: user.phone,
        roomId: user.roomId?._id || '', email: user.email || '', address_permanent: user.address_permanent || '', cccd: user.cccd?.number || ''
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        username: '', password: '', full_name: '', phone: '', roomId: '', email: '', address_permanent: '', cccd: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (editingUser) {
        await axiosClient.put(`/users/${editingUser._id}`, formData, { headers });
        alert('Cập nhật thành công!');
      } else {
        await axiosClient.post('/users', formData, { headers });
        alert('Thêm cư dân thành công!');
      }
      setIsModalOpen(false);
      fetchData(); 
    } catch (error: unknown) { // [FIX 4] Xử lý lỗi chuẩn chỉnh
       if (axios.isAxiosError(error)) {
           // Ép kiểu data trả về để lấy message
           const data = error.response?.data as ErrorResponse;
           alert(data?.message || 'Có lỗi xảy ra');
       } else {
           alert('Có lỗi không xác định xảy ra');
       }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa cư dân này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosClient.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error: unknown) { 
      console.error(error);
      alert('Xóa thất bại'); 
    }
  };

  const handleResetPassword = async (id: string, username: string) => {
    if (!window.confirm(`Reset mật khẩu của "${username}" về 123456?`)) return;
    try {
        const token = localStorage.getItem('token');
        await axiosClient.put(`/users/${id}/reset-password`, {}, { headers: { Authorization: `Bearer ${token}` } });
        alert('Đã reset mật khẩu thành công: 123456');
    } catch (error: unknown) { console.error(error); alert('Lỗi khi reset mật khẩu'); }
  };

  // --- HANDLERS HỢP ĐỒNG ---
  const openContractModal = (user: Tenant) => {
    const currentRoomId = user.roomId?._id || '';
    const currentRoom = rooms.find(r => r._id === currentRoomId);
    const suggestedPrice = currentRoom ? currentRoom.base_price : 0;
    const defaultDuration = 12;
    const today = new Date().toISOString().split('T')[0];

    setContractForm({
      tenant_id: user._id,
      tenant_name: user.full_name,
      room_id: currentRoomId,
      start_date: today,
      duration_months: defaultDuration,
      end_date_preview: calculateEndDate(today, defaultDuration),
      rental_price: suggestedPrice,
      deposit_amount: suggestedPrice 
    });
    setIsContractModalOpen(true);
  };

  const handleContractInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto fill giá khi chọn phòng
    if (name === 'room_id') {
       const selectedRoom = rooms.find(r => r._id === value);
       if (selectedRoom) {
          setContractForm(prev => ({
             ...prev,
             room_id: value,
             rental_price: selectedRoom.base_price,
             deposit_amount: selectedRoom.base_price
          }));
          return;
       }
    }

    // Cập nhật ngày kết thúc preview khi đổi ngày bắt đầu hoặc thời hạn
    if (name === 'start_date' || name === 'duration_months') {
        const newStart = name === 'start_date' ? value : contractForm.start_date;
        const newDuration = name === 'duration_months' ? parseInt(value) : contractForm.duration_months;
        
        setContractForm(prev => ({
            ...prev,
            [name]: value,
            end_date_preview: calculateEndDate(newStart, newDuration)
        }));
        return;
    }

    setContractForm({ ...contractForm, [name]: value });
  };

  // Hàm chọn nhanh thời hạn (6 tháng, 1 năm)
  const setDuration = (months: number) => {
      setContractForm(prev => ({
          ...prev,
          duration_months: months,
          end_date_preview: calculateEndDate(prev.start_date, months)
      }));
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.room_id) return alert('Vui lòng chọn phòng!');
    
    try {
       const token = localStorage.getItem('token');
       await axiosClient.post('/contracts', contractForm, {
          headers: { Authorization: `Bearer ${token}` }
       });
       alert('Lập hợp đồng thành công!');
       setIsContractModalOpen(false);
       fetchData(); 
    } catch (error: unknown) { // [FIX 5] Xử lý lỗi Hợp đồng
       if (axios.isAxiosError(error)) {
           const data = error.response?.data as ErrorResponse;
           alert(data?.message || 'Lỗi khi tạo hợp đồng');
       } else {
           alert('Lỗi không xác định khi tạo hợp đồng');
       }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Cư dân</h1>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Thêm cư dân
        </button>
      </div>

      {/* Table - ĐÃ THÊM NHIỀU CỘT HƠN */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-max">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Phòng</th>
              <th className="px-6 py-4">CCCD / CMND</th>
              <th className="px-6 py-4">Liên hệ (SĐT/Email)</th>
              <th className="px-6 py-4">Địa chỉ quê</th>
              <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : tenants.map((tenant) => (
              <tr key={tenant._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{tenant.full_name}</div>
                    <div className="text-xs text-gray-400">@{tenant.username}</div>
                </td>
                <td className="px-6 py-4">
                  {tenant.roomId ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
                      {tenant.roomId.name}
                    </span>
                  ) : <span className="text-gray-400 italic text-xs bg-gray-100 px-2 py-0.5 rounded">Chưa xếp</span>}
                </td>
                <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                    {tenant.cccd?.number || '---'}
                </td>
                <td className="px-6 py-4">
                   <div className="text-gray-900 dark:text-white font-medium">{tenant.phone}</div>
                   <div className="text-xs text-gray-500">{tenant.email}</div>
                </td>
                <td className="px-6 py-4 max-w-50 truncate text-gray-600 dark:text-gray-400" title={tenant.address_permanent}>
                    {tenant.address_permanent || '---'}
                </td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <button 
                    onClick={() => openContractModal(tenant)}
                    className="p-1.5 text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                    title="Lập hợp đồng thuê"
                  >
                    <span className="text-sm font-bold flex items-center gap-1">✍️ Hợp đồng</span>
                  </button>

                  <button onClick={() => openModal(tenant)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa thông tin">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleResetPassword(tenant._id, tenant.username)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Reset Mật khẩu">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(tenant._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL USER (Thêm/Sửa cư dân) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 my-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {editingUser ? 'Cập nhật thông tin' : 'Thêm cư dân mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tài khoản *</label>
                  <input name="username" value={formData.username} onChange={handleInputChange} disabled={!!editingUser} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-50" required />
                </div>
                 {!editingUser && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu *</label>
                     <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                   </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên *</label>
                <input name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại *</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                   <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input name="cccd" placeholder="CCCD" value={formData.cccd} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                 <input name="address_permanent" placeholder="Địa chỉ thường trú" value={formData.address_permanent} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gán phòng nhanh (tùy chọn)</label>
                <select name="roomId" value={formData.roomId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <option value="">-- Chưa xếp phòng --</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>{room.name} {room.status === 'RENTED' ? '(Đang thuê)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{editingUser ? 'Lưu' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL LẬP HỢP ĐỒNG (CẢI TIẾN) --- */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 border-t-4 border-purple-500">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                 <span>✍️</span> Lập Hợp Đồng Thuê
              </h2>
              <form onSubmit={handleContractSubmit} className="space-y-4">
                 {/* Thông tin Tenant */}
                 <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Người thuê</p>
                    <p className="font-bold text-gray-800 dark:text-white text-lg">{contractForm.tenant_name}</p>
                 </div>

                 {/* Chọn phòng */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chọn phòng *</label>
                    <select 
                       name="room_id" 
                       value={contractForm.room_id} 
                       onChange={handleContractInputChange} 
                       className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-purple-500"
                       required
                    >
                       <option value="">-- Chọn phòng --</option>
                       {rooms.map((room) => (
                          <option key={room._id} value={room._id}>
                             {room.name} - {new Intl.NumberFormat('vi-VN').format(room.base_price)}đ {room.status === 'RENTED' ? '(Full)' : ''}
                          </option>
                       ))}
                    </select>
                 </div>

                 {/* Thời gian & Thời hạn */}
                 <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thời hạn hợp đồng</label>
                    <div className="flex gap-2 mb-3">
                        <button type="button" onClick={() => setDuration(6)} className={`px-3 py-1 text-sm rounded border ${contractForm.duration_months === 6 ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'}`}>6 Tháng</button>
                        <button type="button" onClick={() => setDuration(12)} className={`px-3 py-1 text-sm rounded border ${contractForm.duration_months === 12 ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'}`}>1 Năm</button>
                        <div className="flex items-center gap-1">
                            <input type="number" name="duration_months" value={contractForm.duration_months} onChange={handleContractInputChange} className="w-16 px-2 py-1 text-sm border rounded text-center" />
                            <span className="text-sm text-gray-500">tháng</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs text-gray-500 block mb-1">Ngày bắt đầu</label>
                           <input type="date" name="start_date" value={contractForm.start_date} onChange={handleContractInputChange} className="w-full px-3 py-1.5 text-sm border rounded-lg" required />
                        </div>
                        <div>
                           <label className="text-xs text-gray-500 block mb-1">Ngày hết hạn (Dự kiến)</label>
                           <div className="w-full px-3 py-1.5 text-sm border rounded-lg bg-gray-100 text-gray-700 font-bold">
                               {contractForm.end_date_preview}
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Tiền nong */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá thuê (VNĐ)</label>
                       <input type="number" name="rental_price" value={contractForm.rental_price} onChange={handleContractInputChange} className="w-full px-4 py-2 border rounded-lg font-bold text-purple-700" required />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiền cọc (VNĐ)</label>
                       <input type="number" name="deposit_amount" value={contractForm.deposit_amount} onChange={handleContractInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <button type="button" onClick={() => setIsContractModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                    <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-lg shadow-purple-500/30">Xác nhận Hợp Đồng</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default UserManager;
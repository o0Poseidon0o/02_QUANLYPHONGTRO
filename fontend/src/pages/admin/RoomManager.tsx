import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../../utils/axiosConfig';
interface Room {
  _id: string;
  name: string;
  floor: number;
  area_m2: number;
  base_price: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  facilities: string[];
}

const RoomManager = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    floor: 1,
    area_m2: 20,
    base_price: 3000000,
    status: 'AVAILABLE',
    facilities: '' // Nhập string rồi convert sang array
  });

  // Fetch Rooms
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axiosClient.get('/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(data);
    } catch (error) {
      console.error(error);
      alert('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open Modal
  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        floor: room.floor,
        area_m2: room.area_m2,
        base_price: room.base_price,
        status: room.status,
        facilities: room.facilities.join(', ') // Array -> String để hiển thị
      });
    } else {
      setEditingRoom(null);
      setFormData({ 
        name: '', floor: 1, area_m2: 20, base_price: 3000000, 
        status: 'AVAILABLE', facilities: 'Wifi, Máy lạnh, Giường' 
      });
    }
    setIsModalOpen(true);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Xử lý dữ liệu trước khi gửi
    const submitData = {
        ...formData,
        // String -> Array
        facilities: formData.facilities.split(',').map(item => item.trim()).filter(item => item !== '')
    };

    try {
      if (editingRoom) {
        await axiosClient.put(`/rooms/${editingRoom._id}`, submitData, { headers });
        alert('Cập nhật phòng thành công!');
      } else {
        await axiosClient.post('/rooms', submitData, { headers });
        alert('Thêm phòng mới thành công!');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } else {
            alert('Có lỗi xảy ra');
        }
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa phòng này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosClient.delete(`/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Không thể xóa phòng');
    }
  };

  // Helper: Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper: Màu trạng thái
  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'AVAILABLE': return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">Trống</span>;
        case 'RENTED': return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">Đã thuê</span>;
        case 'MAINTENANCE': return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">Bảo trì</span>;
        default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Phòng</h1>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Thêm phòng mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-200">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Tên phòng</th>
              <th className="px-6 py-4 text-center">Tầng</th>
              <th className="px-6 py-4">Diện tích</th>
              <th className="px-6 py-4">Giá thuê</th>
              <th className="px-6 py-4">Tiện ích</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : rooms.map((room) => (
              <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{room.name}</td>
                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{room.floor}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{room.area_m2} m²</td>
                <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">
                    {formatCurrency(room.base_price)}
                </td>
                <td className="px-6 py-4 max-w-50 truncate text-gray-500" title={room.facilities.join(', ')}>
                    {room.facilities.join(', ')}
                </td>
                <td className="px-6 py-4">
                    {getStatusBadge(room.status)}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(room)} className="text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                  <button onClick={() => handleDelete(room._id)} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {editingRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên phòng *</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tầng *</label>
                        <input type="number" name="floor" value={formData.floor} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diện tích (m²) *</label>
                        <input type="number" name="area_m2" value={formData.area_m2} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá thuê (VND) *</label>
                        <input type="number" name="base_price" value={formData.base_price} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                        <option value="AVAILABLE">Còn trống</option>
                        <option value="RENTED">Đã thuê</option>
                        <option value="MAINTENANCE">Đang bảo trì</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiện ích (phân cách bằng dấu phẩy)</label>
                    <input name="facilities" value={formData.facilities} onChange={handleInputChange} placeholder="VD: Wifi, Điều hòa, Nóng lạnh" className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">{editingRoom ? 'Lưu thay đổi' : 'Tạo mới'}</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
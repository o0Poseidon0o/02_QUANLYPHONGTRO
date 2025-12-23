import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '../../utils/axiosConfig';
// Interface Hóa đơn
interface Bill {
  _id: string;
  tenantId: { _id: string; full_name: string; username: string };
  roomId: { _id: string; name: string };
  month: number;
  year: number;
  total_amount: number;
  is_paid: boolean;
  elec_new: number; elec_old: number; elec_price: number;
  water_new: number; water_old: number; water_price: number;
}

interface TenantSimple {
  _id: string;
  full_name: string;
  roomId?: { 
    name: string;
    base_price: number; 
  };
}

const BillManager = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [tenants, setTenants] = useState<TenantSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State: Thêm trường elec_price và water_price vào đây
  const [formData, setFormData] = useState({
    tenantId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    elec_old: 0,
    elec_new: 0,
    // Giá mặc định, nhưng có thể sửa trên giao diện
    elec_price: 3500, 
    water_old: 0,
    water_new: 0,
    // Giá mặc định
    water_price: 20000, 
    service_fee: 100000,
    other_fee: 0
  });

  const [previewTotal, setPreviewTotal] = useState(0);
  const [currentRoomPrice, setCurrentRoomPrice] = useState(0);

  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const billsRes = await axiosClient.get('/bills', { headers });
      setBills(billsRes.data);

      const usersRes = await axiosClient.get('/users', { headers });
      setTenants(usersRes.data);
    } catch (error) {
      console.error(error);
      alert('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Tự động tính tiền (Preview)
  useEffect(() => {
    // Sử dụng giá điện/nước từ formData thay vì hằng số cố định
    const elec_cost = (formData.elec_new - formData.elec_old) * formData.elec_price;
    const water_cost = (formData.water_new - formData.water_old) * formData.water_price;
    
    let actualRoomPrice = 0;
    if (formData.tenantId) {
        const selectedTenant = tenants.find(t => t._id === formData.tenantId);
        if (selectedTenant && selectedTenant.roomId) {
            actualRoomPrice = selectedTenant.roomId.base_price;
        }
    }
    setCurrentRoomPrice(actualRoomPrice);

    const total = actualRoomPrice + elec_cost + water_cost + Number(formData.service_fee) + Number(formData.other_fee);
    setPreviewTotal(Math.max(0, total));
  }, [formData, tenants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axiosClient.post('/bills', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Tạo hóa đơn thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Lỗi khi tạo hóa đơn');
      } else {
        alert('Đã có lỗi xảy ra');
      }
    }
  };

  const toggleStatus = async (bill: Bill) => {
    try {
      const token = localStorage.getItem('token');
      await axiosClient.put(`/bills/${bill._id}`, 
        { is_paid: !bill.is_paid }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Xóa hóa đơn này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosClient.delete(`/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { alert('Lỗi xóa'); }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Hóa đơn</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Lập hóa đơn mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-225">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Phòng / Cư dân</th>
              <th className="px-6 py-4">Kỳ hóa đơn</th>
              <th className="px-6 py-4">Chi tiết điện (Số/Giá)</th>
              <th className="px-6 py-4">Chi tiết nước (Khối/Giá)</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">Đang tải...</td></tr>
            ) : bills.map((bill) => (
              <tr key={bill._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 dark:text-white">{bill.roomId?.name || 'Phòng đã xóa'}</div>
                  <div className="text-xs text-gray-500">{bill.tenantId?.full_name}</div>
                </td>
                <td className="px-6 py-4">
                  Tháng {bill.month}/{bill.year}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                   Tiêu thụ: <span className="font-bold">{bill.elec_new - bill.elec_old}</span> số <br/>
                   Giá: {formatCurrency(bill.elec_price || 3500)}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                   Tiêu thụ: <span className="font-bold">{bill.water_new - bill.water_old}</span> khối <br/>
                   Giá: {formatCurrency(bill.water_price || 20000)}
                </td>
                <td className="px-6 py-4 font-bold text-primary-600 dark:text-primary-400 text-base">
                  {formatCurrency(bill.total_amount)}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(bill)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${bill.is_paid 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                  >
                    {bill.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(bill._id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Lập Hóa Đơn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fade-in my-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-2 dark:border-slate-700">
              Lập hóa đơn mới
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chọn Cư dân / Phòng *</label>
                <select 
                  name="tenantId" 
                  value={formData.tenantId} 
                  onChange={handleInputChange} 
                  required
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="">-- Chọn cư dân --</option>
                  {tenants.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.full_name} ({t.roomId?.name || 'Chưa xếp phòng'}) 
                      {t.roomId?.base_price ? ` - Giá: ${formatCurrency(t.roomId.base_price)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tháng</label>
                   <input type="number" name="month" value={formData.month} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Năm</label>
                   <input type="number" name="year" value={formData.year} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
              </div>

              {/* KHU VỰC NHẬP CHỈ SỐ + GIÁ */}
              <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-4">
                {/* ĐIỆN */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Điện cũ</label>
                    <input type="number" name="elec_old" value={formData.elec_old} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Điện mới</label>
                    <input type="number" name="elec_new" value={formData.elec_new} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-300 rounded dark:bg-slate-700 dark:border-blue-500 dark:text-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Đơn giá Điện</label>
                    <input type="number" name="elec_price" value={formData.elec_price} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-300 rounded dark:bg-slate-700 dark:border-orange-500 dark:text-white" />
                  </div>
                </div>

                {/* NƯỚC */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nước cũ</label>
                    <input type="number" name="water_old" value={formData.water_old} onChange={handleInputChange} className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Nước mới</label>
                    <input type="number" name="water_new" value={formData.water_new} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-300 rounded dark:bg-slate-700 dark:border-blue-500 dark:text-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Đơn giá Nước</label>
                    <input type="number" name="water_price" value={formData.water_price} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-300 rounded dark:bg-slate-700 dark:border-orange-500 dark:text-white" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phí dịch vụ</label>
                    <input type="number" name="service_fee" value={formData.service_fee} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phụ thu khác</label>
                    <input type="number" name="other_fee" value={formData.other_fee} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                 </div>
              </div>

              {/* Tổng tiền dự kiến */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tiền phòng:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(currentRoomPrice)}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-blue-200 dark:border-blue-700 pt-2">
                    <span className="text-blue-800 dark:text-blue-300 font-medium">Tổng cộng (Dự kiến):</span>
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(previewTotal)}</span>
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold shadow-lg">Lưu Hóa Đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillManager;
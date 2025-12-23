import { useEffect, useState } from 'react';
import axiosClient from '../../utils/axiosConfig';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx'; 
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper format tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- COMPONENTS CON ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatCard = ({ title, value, subtext, icon, colorClass }: any) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <span className="text-sm text-gray-500 dark:text-gray-400">{subtext}</span>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    emptyRooms: 0,
    rentedRooms: 0,
    pendingBills: 0,
    pendingAmount: 0,
    revenue: 0,
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Gọi API lấy Thống kê
        const statsRes = await axiosClient.get('/dashboard/stats', { headers });
        setStats(statsRes.data);

        // 2. Gọi API lấy Hoạt động gần đây
        const billsRes = await axiosClient.get('/bills', { headers });
        setRecentActivities(billsRes.data.slice(0, 5)); 

      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- 3. HÀM XUẤT EXCEL ---
  const handleExportExcel = () => {
    // Tạo Workbook mới
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const overviewData = [
        { "Mục": "Tổng số phòng", "Giá trị": stats.totalRooms },
        { "Mục": "Đang thuê", "Giá trị": stats.rentedRooms },
        { "Mục": "Phòng trống", "Giá trị": stats.emptyRooms },
        { "Mục": "Doanh thu thực tế", "Giá trị": stats.revenue },
        { "Mục": "Nợ chưa thu", "Giá trị": stats.pendingAmount },
    ];
    const ws1 = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, "Tổng quan");

    // Sheet 2: Hóa đơn gần đây
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const billsData = recentActivities.map((bill: any) => ({
        "Phòng": bill.roomId?.name || "N/A",
        "Người thuê": bill.tenantId?.full_name || "N/A",
        "Tổng tiền": bill.total_amount,
        "Trạng thái": bill.is_paid ? "Đã thu" : "Chưa thu",
        "Ngày tạo": new Date(bill.created_at).toLocaleDateString('vi-VN')
    }));
    const ws2 = XLSX.utils.json_to_sheet(billsData);
    XLSX.utils.book_append_sheet(wb, ws2, "Hóa đơn mới");

    // Xuất file
    XLSX.writeFile(wb, `Bao_cao_Doanh_thu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  // --- 4. DỮ LIỆU CHO BIỂU ĐỒ TRÒN ---
  const pieData = [
    { name: 'Đang thuê', value: stats.rentedRooms },
    { name: 'Còn trống', value: stats.emptyRooms },
  ];
  const COLORS = ['#3B82F6', '#FB923C']; // Xanh (Đang thuê) - Cam (Trống)

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tổng quan</h1>
        <button 
            onClick={handleExportExcel}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Xuất báo cáo Excel
        </button>
      </div>

      {/* Grid Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng số phòng" 
          value={stats.totalRooms} 
          subtext={`${stats.rentedRooms} phòng đang thuê`}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard 
          title="Phòng trống" 
          value={stats.emptyRooms} 
          subtext="Cần tìm khách thuê"
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
        />
        <StatCard 
          title="Hóa đơn chưa thu" 
          value={stats.pendingBills} 
          subtext={`Tổng nợ: ${formatCurrency(stats.pendingAmount)}`}
          colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Doanh thu thực tế" 
          value={formatCurrency(stats.revenue)} 
          subtext="Đã thanh toán (Tổng)"
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Khu vực chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- 5. BIỂU ĐỒ TRÒN --- */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700 flex flex-col">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Biểu đồ trạng thái phòng</h3>
              <Link to="/admin/rooms" className="text-sm text-primary-600 hover:underline">Quản lý phòng</Link>
           </div>
           
           <div className="flex-1 min-h-75 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Tạo biểu đồ Donut (rỗng giữa)
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    // [FIX] Thêm (percent || 0) để tránh lỗi undefined
                    label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} phòng`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Hóa đơn mới nhất</h3>
           <ul className="space-y-4">
             {recentActivities.length === 0 ? (
                <p className="text-gray-400 italic text-sm">Chưa có hoạt động nào.</p>
             ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentActivities.map((bill: any) => (
                  <li key={bill._id} className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-slate-700 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {bill.roomId?.name || 'Phòng ?'} - {bill.tenantId?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(bill.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(bill.total_amount)}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${bill.is_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {bill.is_paid ? 'Đã thu' : 'Chưa thu'}
                      </span>
                    </div>
                  </li>
                ))
             )}
           </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
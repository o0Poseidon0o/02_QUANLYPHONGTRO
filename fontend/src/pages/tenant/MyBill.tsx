import { useEffect, useState } from "react";
import axios from "axios";
import axiosClient from '../../utils/axiosConfig';
// Helper format tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Interface dữ liệu từ API trả về
interface BillData {
  _id: string;
  month: number;
  year: number;
  roomId: { name: string };
  total_amount: number;
  is_paid: boolean;

  // Chi tiết điện nước
  elec_old: number;
  elec_new: number;
  elec_price: number;
  water_old: number;
  water_new: number;
  water_price: number;
  room_price: number;
  service_fee: number;
  other_fee: number;
}

const MyBill = () => {
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBill = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const { data } = await axiosClient.get(
          "/bills/my-bills",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data && data.length > 0) {
          setBill(data[0]);
        }
      } catch (error: unknown) {
        console.error("Lỗi tải hóa đơn:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyBill();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải hóa đơn...</div>
    );

  if (!bill) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-white dark:bg-slate-800 rounded-xl shadow-sm">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">
          Chưa có hóa đơn nào
        </h2>
        <p className="text-gray-500">
          Hiện tại bạn chưa có hóa đơn thanh toán nào.
        </p>
      </div>
    );
  }

  // --- CHUYỂN ĐỔI DỮ LIỆU ĐỂ HIỂN THỊ BẢNG ---
  const billItems = [
    {
      name: "Tiền phòng",
      quantity: 1,
      price: bill.room_price,
      total: bill.room_price,
    },
    {
      name: `Điện (Số cũ: ${bill.elec_old} - Mới: ${bill.elec_new})`,
      quantity: bill.elec_new - bill.elec_old,
      price: bill.elec_price,
      total: (bill.elec_new - bill.elec_old) * bill.elec_price,
    },
    {
      name: `Nước (Số cũ: ${bill.water_old} - Mới: ${bill.water_new})`,
      quantity: bill.water_new - bill.water_old,
      price: bill.water_price,
      total: (bill.water_new - bill.water_old) * bill.water_price,
    },
    {
      name: "Phí dịch vụ (Rác, Wifi, Vệ sinh...)",
      quantity: 1,
      price: bill.service_fee,
      total: bill.service_fee,
    },
  ];

  if (bill.other_fee > 0) {
    billItems.push({
      name: "Phụ thu khác",
      quantity: 1,
      price: bill.other_fee,
      total: bill.other_fee,
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* --- PHẦN HEADER HIỂN THỊ THÔNG TIN PHÒNG --- */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 relative overflow-hidden">
         {/* Background trang trí */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-slate-700 rounded-bl-full -mr-8 -mt-8 z-0"></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 tracking-wide">
                     Hóa đơn tháng {bill.month}/{bill.year}
                  </span>
               </div>
               <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  {bill.roomId?.name || "Phòng ..."}
               </h1>
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Vui lòng thanh toán trước ngày 05 hàng tháng
               </p>
            </div>

            {/* Badge Trạng thái thanh toán */}
            <div className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm border
               ${bill.is_paid 
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
               }`}>
               <span className={`w-2.5 h-2.5 rounded-full ${bill.is_paid ? "bg-green-500" : "bg-red-500 animate-pulse"}`}></span>
               {bill.is_paid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
            </div>
         </div>
      </div>

      {/* --- BẢNG CHI TIẾT --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4">Khoản thu</th>
                <th className="px-6 py-4 text-center">Số lượng</th>
                <th className="px-6 py-4 text-right">Đơn giá</th>
                <th className="px-6 py-4 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {billItems.map((item, index) => (
                <tr
                  key={index}
                  className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-600">
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-5 text-right font-bold text-gray-900 dark:text-white uppercase text-base"
                >
                  Tổng cộng phải thanh toán
                </td>
                <td className="px-6 py-5 text-right font-bold text-2xl text-primary-600 dark:text-primary-400">
                  {formatCurrency(bill.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- NÚT HÀNH ĐỘNG --- */}
      {!bill.is_paid && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t dark:border-slate-700">
          <button className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
            Báo sai sót
          </button>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thanh toán ngay (QR Code)
          </button>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 pb-4">
        Mọi thắc mắc xin vui lòng liên hệ Ban quản lý: 0987.654.321
      </div>
    </div>
  );
};

export default MyBill;
import React from 'react';
import { AttendanceRecord } from '../types';
import { X, Printer, CheckCircle, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b162f] border border-cyan-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0e1d3d] border-b border-cyan-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 glow-cyan-sm" />
            <h3 className="text-sm font-bold text-slate-100">
              إيصال سداد واستقبال إلكتروني
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-[#081126] font-sans">
          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-700">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/50 mb-2 glow-cyan-sm">
              <CheckCircle className="w-6 h-6 text-cyan-400" />
            </div>
            <h4 className="text-base font-extrabold text-white">سنتر الأوائل التعليمي المتميز</h4>
            <p className="text-xs text-slate-400 mt-0.5">منظومة الاستقبال بنمط التدفق الدائري</p>
            <div className="mt-2 text-xs font-mono font-bold text-cyan-300">
              رقم الإيصال: {record.receiptNumber}
            </div>
          </div>

          {/* Details Grid */}
          <div className="py-4 space-y-2.5 text-xs border-b border-dashed border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">اسم الطالب:</span>
              <strong className="text-white text-sm">{record.studentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">كود الطالب:</span>
              <span className="font-mono font-bold text-cyan-300">{record.studentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">المادة والحصة:</span>
              <span className="text-slate-200">{record.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">المدرس:</span>
              <span className="text-slate-200 font-bold">{record.teacherName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">القاعة:</span>
              <span className="text-slate-200">{record.hallName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">وقت وتاريخ الدخول:</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {record.checkInTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">طريقة الدفع:</span>
              <span className="text-orange-300 font-semibold">
                {record.paymentMethod === 'cash' ? 'نقداً كاش' : record.paymentMethod === 'instapay' ? 'إنستاباي / فيزا' : 'إعفاء'}
              </span>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="py-4 space-y-2 text-xs bg-[#0a1633] p-3 rounded-xl my-3 border border-slate-800">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-200">المبلغ المدفوع:</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono tabular-nums">
                {record.amountPaid} ج.م
              </span>
            </div>
            {record.remainingAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-orange-400 font-bold">
                <span>المتبقي المطلوب سداده:</span>
                <span className="font-mono tabular-nums">{record.remainingAmount} ج.م</span>
              </div>
            )}
          </div>

          {/* Verification Barcode footer */}
          <div className="text-center pt-2 flex flex-col items-center">
            <div className="p-2 bg-white rounded-lg inline-block">
              <QrCode className="w-14 h-14 text-black" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              يرجى الاحتفاظ بهذا الإيصال وإبرازه عند الدخول للمدرج
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-[#0e1d3d] border-t border-cyan-900/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md glow-cyan-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الإيصال الفوري</span>
          </button>
        </div>
      </div>
    </div>
  );
};

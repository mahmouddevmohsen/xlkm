import React from 'react';
import { AttendanceRecord } from '../types';
import { DollarSign, Banknote, CreditCard, AlertTriangle, TrendingUp, Download } from 'lucide-react';

interface FinancialLedgerViewProps {
  records: AttendanceRecord[];
}

export const FinancialLedgerView: React.FC<FinancialLedgerViewProps> = ({ records }) => {
  const totalCash = records
    .filter((r) => r.paymentMethod === 'cash')
    .reduce((sum, r) => sum + r.amountPaid, 0);

  const totalDigital = records
    .filter((r) => r.paymentMethod === 'instapay' || r.paymentMethod === 'card')
    .reduce((sum, r) => sum + r.amountPaid, 0);

  const totalOutstanding = records.reduce((sum, r) => sum + r.remainingAmount, 0);
  const totalCollected = totalCash + totalDigital;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          دفتر اليومية وخزينة الاستقبال
          <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-800">
            تحديث لحظي
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          مطابقة الخزينة النقدية والتحويلات الرقمية مع تتبع المديونيات والمتبقيات على الطلاب
        </p>
      </div>

      {/* 4 Financial KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a1532] border border-emerald-700/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>إجمالي الإيراد المحصل</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {totalCollected.toLocaleString()} ج.م
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">شامل جميع طرق السداد</span>
        </div>

        <div className="bg-[#0a1532] border border-orange-700/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>النقدية في الخزينة (كاش)</span>
            <Banknote className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-orange-400 font-mono tabular-nums">
            {totalCash.toLocaleString()} ج.م
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">في درج الاستقبال الآن</span>
        </div>

        <div className="bg-[#0a1532] border border-cyan-700/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>تحويلات إنستاباي وفيزا</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {totalDigital.toLocaleString()} ج.م
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">محفظة وبنك السنتر</span>
        </div>

        <div className="bg-[#0a1532] border border-rose-700/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>متبقيات متأخرة على الطلاب</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono tabular-nums">
            {totalOutstanding.toLocaleString()} ج.م
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">أقساط مطلوبة الحصة القادمة</span>
        </div>
      </div>

      {/* Detailed Operations Log */}
      <div className="bg-[#0a142c] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 mb-4">
          أحدث الحركات المالية المسجلة بالاستقبال
        </h3>
        <div className="divide-y divide-slate-800 text-xs">
          {records.slice(0, 8).map((r) => (
            <div key={r.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-cyan-400 font-bold">{r.receiptNumber}</span>
                <span className="text-slate-200 font-semibold">{r.studentName}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{r.subject}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-mono tabular-nums">{r.checkInTime}</span>
                <span className="font-mono font-bold text-emerald-400">{r.amountPaid} ج.م</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                  {r.paymentMethod === 'cash' ? 'كاش' : r.paymentMethod === 'instapay' ? 'إنستاباي' : 'إعفاء'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

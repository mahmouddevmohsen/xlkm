import React, { useState, useMemo } from 'react';
import { AttendanceRecord, PaymentStatus } from '../types';
import {
  Search,
  Printer,
  FileSpreadsheet,
  MessageCircle,
  Receipt,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowUpDown,
  Filter,
  DollarSign,
  ChevronDown,
} from 'lucide-react';

interface FullWidthAttendanceTableProps {
  records: AttendanceRecord[];
  onOpenReceipt: (record: AttendanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onTogglePaymentStatus: (id: string) => void;
  selectedSessionId: string | null;
  onClearSessionFilter: () => void;
}

export const FullWidthAttendanceTable: React.FC<FullWidthAttendanceTableProps> = ({
  records,
  onOpenReceipt,
  onDeleteRecord,
  onTogglePaymentStatus,
  selectedSessionId,
  onClearSessionFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'name' | 'amount'>('time');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Teacher / Session filter if selected from circular top bar
        if (selectedSessionId && rec.sessionId !== selectedSessionId) {
          return false;
        }

        // Search query (name, code, teacher, receipt)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = rec.studentCode.toLowerCase().includes(q);
          const matchName = rec.studentName.toLowerCase().includes(q);
          const matchTeacher = rec.teacherName.toLowerCase().includes(q);
          const matchReceipt = rec.receiptNumber.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchTeacher && !matchReceipt) {
            return false;
          }
        }

        // Payment status filter
        if (filterPayment === 'paid_full') return rec.paymentStatus === 'paid_full';
        if (filterPayment === 'paid_partial') return rec.paymentStatus === 'paid_partial';
        if (filterPayment === 'unpaid') return rec.paymentStatus === 'unpaid';
        if (filterPayment === 'exempt') return rec.paymentStatus === 'exempt';
        if (filterPayment === 'has_due') return rec.remainingAmount > 0;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time') {
          return sortOrder === 'desc'
            ? b.checkInTime.localeCompare(a.checkInTime)
            : a.checkInTime.localeCompare(b.checkInTime);
        }
        if (sortBy === 'name') {
          return sortOrder === 'desc'
            ? b.studentName.localeCompare(a.studentName)
            : a.studentName.localeCompare(b.studentName);
        }
        if (sortBy === 'amount') {
          return sortOrder === 'desc' ? b.amountPaid - a.amountPaid : a.amountPaid - b.amountPaid;
        }
        return 0;
      });
  }, [records, selectedSessionId, searchQuery, filterPayment, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['رقم الإيصال,كود الطالب,اسم الطالب,الحصة,المدرس,وقت الحضور,حالة السداد,المسدد,المتبقي,طريقة الدفع,ملاحظات'];
    const rows = filteredRecords.map((r) =>
      `"${r.receiptNumber}","${r.studentCode}","${r.studentName}","${r.subject}","${r.teacherName}","${r.checkInTime}","${r.paymentStatus}","${r.amountPaid}","${r.remainingAmount}","${r.paymentMethod}","${r.notes || ''}"`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_حضور_السنتر_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <section className="w-full px-6 py-6 bg-[#070d1e] flex-1 flex flex-col">
      {/* Table Controls & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-4">
        {/* Title & Quick Record Counts */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              جدول الحضور الموسّع الكامل
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#0d1c3a] text-cyan-300 rounded-full border border-cyan-800">
                {filteredRecords.length} طالب حاضر
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              عرض ممتد بعرض الشاشة لرؤية جميع الطلاب الحاضرين دفعة واحدة بدون سكرول طويل
            </p>
          </div>
        </div>

        {/* Search & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الطالب، الكود، المدرس..."
              className="w-full pr-9 pl-3 py-1.5 bg-[#0a1530] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Payment Status Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#0a1530] border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterPayment('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPayment === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterPayment('paid_full')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPayment === 'paid_full'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مسدد
            </button>
            <button
              onClick={() => setFilterPayment('has_due')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPayment === 'has_due'
                  ? 'bg-orange-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عليه متبقي
            </button>
            <button
              onClick={() => setFilterPayment('exempt')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPayment === 'exempt'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              إعفاء
            </button>
          </div>

          {/* Export & Print actions */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#0a1530] border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            title="تصدير ملف إكسيل / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصدير CSV</span>
          </button>
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#0a1530] border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            title="طباعة كشف الحضور"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* Full-Screen-Width High Density Colored Table */}
      <div className="w-full bg-[#0a142c] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl flex-1">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-right text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#0e1b38] border-b border-slate-700/80 text-slate-300 font-semibold select-none">
                <th className="py-3 px-4 whitespace-nowrap">الكود / الإيصال</th>
                <th className="py-3 px-4 whitespace-nowrap">اسم الطالب</th>
                <th className="py-3 px-4 whitespace-nowrap">الحصة والمدرس</th>
                <th className="py-3 px-4 whitespace-nowrap">القاعة</th>
                <th
                  onClick={() => {
                    setSortBy('time');
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  }}
                  className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-cyan-300"
                >
                  <span className="inline-flex items-center gap-1">
                    وقت الحضور
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </span>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">حالة السداد</th>
                <th
                  onClick={() => {
                    setSortBy('amount');
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  }}
                  className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-cyan-300"
                >
                  <span className="inline-flex items-center gap-1">
                    المسدد / المتبقي
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </span>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">طريقة الدفع</th>
                <th className="py-3 px-4 whitespace-nowrap">ملاحظات الاستقبال</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">إجراءات سريعة</th>
              </tr>
            </thead>

            {/* Table Body - High Contrast, Colored Row States */}
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  // Determine colored accent per payment status
                  const isPaidFull = rec.paymentStatus === 'paid_full';
                  const isPartial = rec.paymentStatus === 'paid_partial';
                  const isUnpaid = rec.paymentStatus === 'unpaid';
                  const isExempt = rec.paymentStatus === 'exempt';

                  let rowBgClass = 'hover:bg-slate-800/40';
                  let statusBadgeClass = '';

                  if (isPaidFull) {
                    rowBgClass = 'hover:bg-emerald-950/20 bg-[#08152c]';
                    statusBadgeClass = 'text-emerald-300 bg-emerald-950/70 border border-emerald-500/30';
                  } else if (isPartial) {
                    rowBgClass = 'hover:bg-orange-950/25 bg-[#141527]';
                    statusBadgeClass = 'text-orange-300 bg-orange-950/70 border border-orange-500/40';
                  } else if (isUnpaid) {
                    rowBgClass = 'hover:bg-rose-950/25 bg-[#161325]';
                    statusBadgeClass = 'text-rose-300 bg-rose-950/70 border border-rose-500/40';
                  } else if (isExempt) {
                    rowBgClass = 'hover:bg-teal-950/20 bg-[#08182b]';
                    statusBadgeClass = 'text-teal-300 bg-teal-950/70 border border-teal-500/30';
                  }

                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors duration-150 ${rowBgClass}`}
                    >
                      {/* Code & Receipt */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-cyan-300 tabular-nums">
                            {rec.studentCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rec.receiptNumber}
                          </span>
                        </div>
                      </td>

                      {/* Student Name & Grade */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0e2142] border border-cyan-800 flex items-center justify-center text-[10px] font-bold text-cyan-200">
                            {rec.studentName.slice(0, 1)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {rec.studentName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {rec.grade}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Teacher */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <span className="text-slate-200 font-medium block">
                            {rec.subject}
                          </span>
                          <span className="text-[11px] text-cyan-400 font-medium">
                            {rec.teacherName}
                          </span>
                        </div>
                      </td>

                      {/* Hall */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {rec.hallName}
                      </td>

                      {/* Check-in Time */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums text-slate-300">
                        {rec.checkInTime}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadgeClass}`}
                        >
                          {isPaidFull && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {isPartial && <AlertCircle className="w-3 h-3 text-orange-400" />}
                          {isUnpaid && <AlertCircle className="w-3 h-3 text-rose-400" />}
                          {isExempt && <HelpCircle className="w-3 h-3 text-teal-400" />}

                          {isPaidFull && 'مسدد بالكامل'}
                          {isPartial && 'متبقي قسط'}
                          {isUnpaid && 'غير مسدد (آجل)'}
                          {isExempt && 'منحة إعفاء'}
                        </span>
                      </td>

                      {/* Amount Paid / Remaining */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums">
                        <div>
                          <span className="text-emerald-400 font-bold block">
                            {rec.amountPaid} ج.م
                          </span>
                          {rec.remainingAmount > 0 && (
                            <span className="text-orange-400 text-[11px] font-bold">
                              متبقي: {rec.remainingAmount} ج.م
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {rec.paymentMethod === 'cash' && (
                          <span className="text-orange-300 font-medium">كاش نقدي</span>
                        )}
                        {rec.paymentMethod === 'instapay' && (
                          <span className="text-cyan-300 font-medium">إنستاباي فوري</span>
                        )}
                        {rec.paymentMethod === 'card' && (
                          <span className="text-indigo-300 font-medium">فيزا / كارت</span>
                        )}
                        {rec.paymentMethod === 'none' && (
                          <span className="text-slate-400">بدون</span>
                        )}
                      </td>

                      {/* Reception Notes */}
                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-400 text-[11px]">
                        {rec.notes || '—'}
                      </td>

                      {/* Quick Receptionist Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Receipt */}
                          <button
                            onClick={() => onOpenReceipt(rec)}
                            className="p-1.5 rounded-lg bg-[#0e2142] text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                            title="طباعة إيصال السداد"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Payment */}
                          <button
                            onClick={() => onTogglePaymentStatus(rec.id)}
                            className="p-1.5 rounded-lg bg-[#241a12] text-orange-300 hover:bg-orange-950 transition-colors"
                            title="تعديل حالة السداد"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteRecord(rec.id)}
                            className="p-1.5 rounded-lg bg-[#271015] text-rose-300 hover:bg-rose-950 transition-colors"
                            title="إلغاء تسجيل الحضور"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold mb-1">
                      لا يوجد طلاب مطابقين للبحث أو التصفية الحالية
                    </p>
                    <p className="text-xs text-slate-500">
                      يمكنك مسح كود طالب جديد عبر المحطة المركزية بالأعلى
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

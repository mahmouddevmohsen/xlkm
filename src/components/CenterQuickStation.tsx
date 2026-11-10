import React, { useState, useRef } from 'react';
import { Session, Student, AttendanceRecord, PaymentStatus, PaymentMethod } from '../types';
import {
  Scan,
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Award,
  Clock,
  User,
  Phone,
  MessageCircle,
  HelpCircle,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface CenterQuickStationProps {
  sessions: Session[];
  selectedSessionId: string | null;
  students: Student[];
  onCheckInStudent: (record: Omit<AttendanceRecord, 'id' | 'checkInTime' | 'receiptNumber'>) => void;
  onOpenReceipt: (record: AttendanceRecord) => void;
  lastCheckedInRecord: AttendanceRecord | null;
}

export const CenterQuickStation: React.FC<CenterQuickStationProps> = ({
  sessions,
  selectedSessionId,
  students,
  onCheckInStudent,
  onOpenReceipt,
  lastCheckedInRecord,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedStudent, setScannedStudent] = useState<Student | null>(students[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [partialAmountInput, setPartialAmountInput] = useState<number>(40);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Active or selected session
  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) ||
    (scannedStudent ? sessions.find((s) => s.id === scannedStudent.registeredSessionId) : null) ||
    sessions[0];

  const showToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const matched = students.find(
      (s) => s.code.toLowerCase() === query.toLowerCase() || s.name.includes(query) || s.phone.includes(query)
    );

    if (matched) {
      setScannedStudent(matched);
      sound.playScanSuccess();
      showToast(`تم مسح كود الطالب بنجاح: ${matched.name}`, 'success');
      setBarcodeInput('');
    } else {
      sound.playWarning();
      showToast(`لم يتم العثور على طالب بالكود: "${query}"`, 'warn');
    }
  };

  const handleSimulateScan = (student: Student) => {
    setScannedStudent(student);
    sound.playScanSuccess();
    showToast(`تم مسح بطاقة: ${student.name}`, 'success');
  };

  // Quick Action: Pay Full Session Fee & Check-in
  const handlePayFullSession = () => {
    if (!scannedStudent) return;
    const fee = activeSession.pricePerSession;

    sound.playCashCollect();
    onCheckInStudent({
      studentId: scannedStudent.id,
      studentCode: scannedStudent.code,
      studentName: scannedStudent.name,
      sessionId: activeSession.id,
      teacherName: activeSession.teacherName,
      subject: activeSession.subject,
      grade: scannedStudent.grade,
      hallName: activeSession.hallName,
      paymentStatus: 'paid_full',
      amountPaid: fee,
      remainingAmount: 0,
      paymentMethod: paymentMethod,
      attendanceState: 'present',
      notes: `سداد كامل للحصة (${fee} ج.م)`,
    });
    showToast(`تم تسجيل الحضور وتحصيل ${fee} ج.م كاش للطالب ${scannedStudent.name}`, 'success');
  };

  // Quick Action: Pay Monthly Subscription
  const handlePayMonthly = () => {
    if (!scannedStudent) return;
    const fee = activeSession.monthlyFee;

    sound.playCashCollect();
    onCheckInStudent({
      studentId: scannedStudent.id,
      studentCode: scannedStudent.code,
      studentName: scannedStudent.name,
      sessionId: activeSession.id,
      teacherName: activeSession.teacherName,
      subject: activeSession.subject,
      grade: scannedStudent.grade,
      hallName: activeSession.hallName,
      paymentStatus: 'paid_full',
      amountPaid: fee,
      remainingAmount: 0,
      paymentMethod: paymentMethod,
      attendanceState: 'present',
      notes: `سداد اشتراك شهر كامل (${fee} ج.م)`,
    });
    showToast(`تم تجديد الاشتراك الشهري (${fee} ج.م) للطالب ${scannedStudent.name}`, 'success');
  };

  // Quick Action: Partial Payment / Remaining Balance
  const handlePayPartial = () => {
    if (!scannedStudent) return;
    const fee = activeSession.pricePerSession;
    const paid = partialAmountInput > fee ? fee : partialAmountInput;
    const remaining = fee - paid;

    sound.playCashCollect();
    onCheckInStudent({
      studentId: scannedStudent.id,
      studentCode: scannedStudent.code,
      studentName: scannedStudent.name,
      sessionId: activeSession.id,
      teacherName: activeSession.teacherName,
      subject: activeSession.subject,
      grade: scannedStudent.grade,
      hallName: activeSession.hallName,
      paymentStatus: 'paid_partial',
      amountPaid: paid,
      remainingAmount: remaining,
      paymentMethod: paymentMethod,
      attendanceState: 'present',
      notes: `سداد جزئي: مدفوع ${paid} ج.م، متبقي ${remaining} ج.م`,
    });
    showToast(`تم تسجيل متبقي ${remaining} ج.م على الطالب ${scannedStudent.name}`, 'warn');
  };

  // Quick Action: Exemption / Scholarship
  const handleExemption = () => {
    if (!scannedStudent) return;

    sound.playScanSuccess();
    onCheckInStudent({
      studentId: scannedStudent.id,
      studentCode: scannedStudent.code,
      studentName: scannedStudent.name,
      sessionId: activeSession.id,
      teacherName: activeSession.teacherName,
      subject: activeSession.subject,
      grade: scannedStudent.grade,
      hallName: activeSession.hallName,
      paymentStatus: 'exempt',
      amountPaid: 0,
      remainingAmount: 0,
      paymentMethod: 'none',
      attendanceState: 'present',
      notes: 'إعفاء ومنحة تفوق دراسي',
    });
    showToast(`تم تسجيل الحضور كمنحة تفوق للطالب ${scannedStudent.name}`, 'success');
  };

  // Quick Action: Just Check-in (Already Paid or Postponed)
  const handleQuickCheckInOnly = () => {
    if (!scannedStudent) return;

    sound.playScanSuccess();
    onCheckInStudent({
      studentId: scannedStudent.id,
      studentCode: scannedStudent.code,
      studentName: scannedStudent.name,
      sessionId: activeSession.id,
      teacherName: activeSession.teacherName,
      subject: activeSession.subject,
      grade: scannedStudent.grade,
      hallName: activeSession.hallName,
      paymentStatus: scannedStudent.balanceDue > 0 ? 'unpaid' : 'paid_full',
      amountPaid: 0,
      remainingAmount: scannedStudent.balanceDue > 0 ? scannedStudent.balanceDue : 0,
      paymentMethod: 'none',
      attendanceState: 'present',
      notes: scannedStudent.balanceDue > 0 ? 'حضور مع مديونية سابقة' : 'حضور اشتراك مسبق',
    });
    showToast(`تم تسجيل دخول ${scannedStudent.name} للقاعة`, 'success');
  };

  // WhatsApp Alert Simulation
  const handleSendWhatsApp = () => {
    if (!scannedStudent) return;
    const msg = encodeURIComponent(
      `مرحباً ولي أمر الطالب/ة: ${scannedStudent.name}، نفيدكم علماً بحضوره لحصة ${activeSession.subject} مع ${activeSession.teacherName} في تمام الساعة الحالية بالسنتر.`
    );
    window.open(`https://wa.me/2${scannedStudent.parentPhone}?text=${msg}`, '_blank');
  };

  return (
    <section className="relative px-6 py-5 bg-[#081026] border-b border-cyan-900/40">
      {/* Toast Feedback Banner */}
      {feedbackToast && (
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-xl border animate-bounce ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 glow-cyan-sm'
              : 'bg-orange-950/90 text-orange-200 border-orange-500/50 glow-orange-sm'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Main Grid: Left Scanner Terminal & Right Circular Action Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Central Quick Scan Terminal (6 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-[#0a1532]/90 border border-cyan-800/40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          {/* Subtle background radar ring decor */}
          <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full border border-cyan-500/10 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-76 h-76 rounded-full border border-cyan-500/5 pointer-events-none" />

          {/* Header of Scanner Terminal */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/60 glow-cyan-sm flex items-center justify-center">
                <QrCode className="w-6 h-6 text-cyan-400" />
                {isScanningActive && (
                  <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-30" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  محطة المسح السريع والتحضير
                  <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 rounded-full border border-cyan-800/60">
                    قارئ الباركود نشط
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  وجّه قارئ الباركود أو ابحث برقم الكود أو الهاتف أو الاسم
                </p>
              </div>
            </div>

            {/* Simulated fast scan buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">تجربة سريعة:</span>
              <button
                type="button"
                onClick={() => handleSimulateScan(students[0])}
                className="px-2 py-1 text-[11px] bg-[#0c1c40] text-cyan-300 hover:bg-cyan-950 rounded border border-cyan-800/50 transition-colors"
                title="طالب مسدد بالكامل"
              >
                10145
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan(students[1])}
                className="px-2 py-1 text-[11px] bg-[#241712] text-orange-300 hover:bg-orange-950 rounded border border-orange-800/50 transition-colors"
                title="طالب عليه متبقي 40 ج"
              >
                10146
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan(students[2])}
                className="px-2 py-1 text-[11px] bg-[#0c1c40] text-cyan-300 hover:bg-cyan-950 rounded border border-cyan-800/50 transition-colors"
                title="طالب لغات"
              >
                10147
              </button>
            </div>
          </div>

          {/* Barcode / Search Input Form */}
          <form onSubmit={handleBarcodeSubmit} className="relative mb-4">
            <div className="relative flex items-center">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="امسح الباركود الآن أو اكتب كود الطالب (مثال: 10145)..."
                className="w-full pl-28 pr-12 py-3 bg-[#060c1d] border-2 border-cyan-500/50 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 glow-cyan-sm transition-all"
              />
              <Scan className="absolute right-4 w-5 h-5 text-cyan-400 pointer-events-none" />
              <button
                type="submit"
                className="absolute left-2 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-all"
              >
                تحضير فوري
              </button>
            </div>
          </form>

          {/* Scanned Student Visual Card */}
          {scannedStudent ? (
            <div className="bg-gradient-to-br from-[#0c1c3f] to-[#071128] border border-cyan-700/50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 relative">
              {/* Circular Student Avatar with Status Ring */}
              <div className="relative shrink-0">
                <div
                  className={`w-18 h-18 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-lg ${
                    scannedStudent.balanceDue > 0
                      ? 'border-orange-500 glow-orange-sm bg-orange-950/40'
                      : 'border-cyan-400 glow-cyan-sm bg-cyan-950/40'
                  }`}
                >
                  <User className="w-9 h-9 text-slate-300" />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    scannedStudent.balanceDue > 0
                      ? 'bg-orange-900 text-orange-200 border-orange-500'
                      : 'bg-cyan-900 text-cyan-200 border-cyan-500'
                  }`}
                >
                  {scannedStudent.code}
                </div>
              </div>

              {/* Student Details */}
              <div className="flex-1 text-center sm:text-right">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h4 className="text-base font-extrabold text-white">
                    {scannedStudent.name}
                  </h4>
                  <span className="text-xs text-slate-400">· {scannedStudent.grade}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-2">
                  <div className="flex items-center gap-1.5 bg-[#09152e] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">الحصة المستهدفة:</span>
                    <strong className="text-cyan-300 truncate">{activeSession.subject}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#09152e] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">المدرس:</span>
                    <strong className="text-slate-100 truncate">{activeSession.teacherName}</strong>
                  </div>
                </div>

                {/* Balance Status Banner */}
                <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">الرصيد المالي السابق:</span>
                    {scannedStudent.balanceDue > 0 ? (
                      <span className="text-orange-400 font-bold font-mono">
                        عليه متبقي {scannedStudent.balanceDue} ج.م
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">
                        خالص الحساب (لا مديونيات)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="إرسال رسالة واتساب لولي الأمر"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب ولي الأمر</span>
                    </button>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400">{scannedStudent.parentPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-800 rounded-xl">
              <Scan className="w-10 h-10 mx-auto text-slate-600 mb-2 animate-pulse" />
              <p className="text-xs">في انتظار مسح كود أول طالب...</p>
            </div>
          )}

          {/* Quick feedback on last check-in */}
          {lastCheckedInRecord && (
            <div className="mt-3 flex items-center justify-between text-xs bg-[#09152e]/90 px-3 py-1.5 rounded-lg border border-cyan-900/30">
              <span className="text-slate-400">آخر تسجيل: <strong className="text-slate-200">{lastCheckedInRecord.studentName}</strong> ({lastCheckedInRecord.checkInTime})</span>
              <button
                type="button"
                onClick={() => onOpenReceipt(lastCheckedInRecord)}
                className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
              >
                <Receipt className="w-3 h-3" />
                <span>إيصال #{lastCheckedInRecord.receiptNumber}</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Circular Collection & Action Dials (6 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-[#0a1532]/90 border border-orange-900/30 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative">
          {/* Header of Circular Collection Station */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-orange-950/70 border border-orange-500/60 glow-orange-sm flex items-center justify-center">
                <Banknote className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  أزرار التحصيل الدائرية المريحة
                </h3>
                <p className="text-xs text-slate-400">
                  تحصيل فوري بضغطة واحدة · مصممة لراحة عين وسرعة موظف الاستقبال
                </p>
              </div>
            </div>

            {/* Payment Method Circular Switchers */}
            <div className="flex items-center gap-1.5 bg-[#070e22] p-1 rounded-full border border-slate-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-orange-500 text-white shadow-md glow-orange-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>كاش نقدي</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  paymentMethod === 'instapay'
                    ? 'bg-cyan-500 text-white shadow-md glow-cyan-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>إنستاباي / فيزا</span>
              </button>
            </div>
          </div>

          {/* Ergonomic Circular Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-auto py-2">
            {/* 1. Full Session Fee Dial (Primary Radiant Button) */}
            <button
              type="button"
              onClick={handlePayFullSession}
              disabled={!scannedStudent}
              className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#0f284a] to-[#0a1832] border-2 border-cyan-500/80 hover:border-cyan-300 glow-cyan-sm hover:glow-cyan-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {/* Circular Dial Face */}
              <div className="w-16 h-16 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-inner group-hover:scale-105 transition-transform mb-2">
                <span className="text-base font-extrabold text-cyan-300 font-mono tabular-nums">
                  {activeSession.pricePerSession}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">ج.م</span>
              </div>
              <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-200">
                حصة كاملة
              </span>
              <span className="text-[10px] text-cyan-400/80">تسجيل وسداد فوري</span>
            </button>

            {/* 2. Monthly Subscription Dial */}
            <button
              type="button"
              onClick={handlePayMonthly}
              disabled={!scannedStudent}
              className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#1b1c3d] to-[#0c1228] border-2 border-indigo-500/60 hover:border-indigo-400 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-950/80 border-2 border-indigo-400 flex flex-col items-center justify-center shadow-inner group-hover:scale-105 transition-transform mb-2">
                <span className="text-base font-extrabold text-indigo-300 font-mono tabular-nums">
                  {activeSession.monthlyFee}
                </span>
                <span className="text-[10px] text-indigo-400 font-bold">ج.م</span>
              </div>
              <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-200">
                اشتراك شهري
              </span>
              <span className="text-[10px] text-indigo-400/80">شامل الملازم</span>
            </button>

            {/* 3. Partial / Remaining Payment Dial */}
            <button
              type="button"
              onClick={handlePayPartial}
              disabled={!scannedStudent}
              className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#2a1a14] to-[#140e1a] border-2 border-orange-500/80 hover:border-orange-300 glow-orange-sm hover:glow-orange-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-orange-950/80 border-2 border-orange-400 flex flex-col items-center justify-center shadow-inner group-hover:scale-105 transition-transform mb-2">
                <span className="text-base font-extrabold text-orange-300 font-mono tabular-nums">
                  {partialAmountInput}
                </span>
                <span className="text-[10px] text-orange-400 font-bold">ج.م</span>
              </div>
              <span className="text-xs font-bold text-slate-100 group-hover:text-orange-200">
                قسط / متبقي
              </span>
              <span className="text-[10px] text-orange-400/80">تسجيل متبقي آجل</span>
            </button>

            {/* 4. Exemption / Honor Scholarship Dial */}
            <button
              type="button"
              onClick={handleExemption}
              disabled={!scannedStudent}
              className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#0c222c] to-[#08151f] border-2 border-teal-500/60 hover:border-teal-400 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-teal-950/80 border-2 border-teal-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform mb-2">
                <Award className="w-7 h-7 text-teal-300" />
              </div>
              <span className="text-xs font-bold text-slate-100 group-hover:text-teal-200">
                إعفاء تفوق
              </span>
              <span className="text-[10px] text-teal-400/80">منحة مجانية 100%</span>
            </button>
          </div>

          {/* Secondary Ergonomic Actions Toolbar */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Custom partial amount slider / quick selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">تحديد المدفوع جزئياً:</span>
              <div className="flex items-center gap-1">
                {[20, 30, 40, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPartialAmountInput(amt)}
                    className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors ${
                      partialAmountInput === amt
                        ? 'bg-orange-500/30 text-orange-300 border-orange-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {amt} ج
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Quick Attendance Only Check-in button */}
            <button
              type="button"
              onClick={handleQuickCheckInOnly}
              disabled={!scannedStudent}
              className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-[#0d1d3d] hover:bg-[#122854] border border-cyan-800 rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>تسجيل دخول فقط (بدون تحصيل)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

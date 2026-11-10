import React, { useState } from 'react';
import { Session, Student } from '../types';
import { X, UserPlus, Check, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: Student) => void;
  sessions: Session[];
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  sessions,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [grade, setGrade] = useState('الصف الثالث الثانوي');
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');
  const [balanceDue, setBalanceDue] = useState(0);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate random 5-digit barcode number
    const randomCode = Math.floor(10000 + Math.random() * 90000).toString();

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      code: randomCode,
      name: name.trim(),
      phone: phone.trim() || '01000000000',
      parentPhone: parentPhone.trim() || '01200000000',
      grade,
      registeredSessionId: selectedSessionId,
      balanceDue: Number(balanceDue) || 0,
      note: notes.trim(),
    };

    sound.playScanSuccess();
    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b1630] border border-cyan-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 bg-[#0e1e40] border-b border-cyan-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-950 border border-orange-500/50 flex items-center justify-center text-orange-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              تسجيل بيانات طالب جديد في الاستقبال
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              اسم الطالب الثلاثي أو الرباعي <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حسام محمد الشريف"
              className="w-full px-3.5 py-2 bg-[#060c1d] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رقم هاتف الطالب
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full px-3.5 py-2 bg-[#060c1d] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رقم ولي الأمر (واتساب) <span className="text-orange-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="01212345678"
                className="w-full px-3.5 py-2 bg-[#060c1d] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                المرحلة الدراسية
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-[#060c1d] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الحصة والمدرس
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-3 py-2 bg-[#060c1d] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.teacherName} - {s.subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              رصيد متبقي سابق (إن وجد)
            </label>
            <input
              type="number"
              value={balanceDue}
              onChange={(e) => setBalanceDue(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3.5 py-2 bg-[#060c1d] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ملاحظات إضافية
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: خصم أخوة / باقة متميزة"
              className="w-full px-3.5 py-2 bg-[#060c1d] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-lg shadow-md glow-orange-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>إتمام الحفظ وإصدار الكود</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

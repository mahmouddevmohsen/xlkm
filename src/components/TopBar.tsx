import React, { useState, useEffect } from 'react';
import { UserPlus, Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  onOpenNewStudent: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  totalPresent: number;
  totalCollected: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenNewStudent,
  activeView,
  setActiveView,
  soundEnabled,
  setSoundEnabled,
  totalPresent,
  totalCollected,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-[#0a1226]/95 border-b border-cyan-900/30 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-700 to-orange-500 p-[2px] glow-cyan-sm flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#070d1e] flex items-center justify-center">
            <span className="text-cyan-400 font-bold text-sm tracking-wider">سَنتر</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-100 tracking-tight whitespace-nowrap">
            منظومة الاستقبال والحضور <span className="text-cyan-400">·</span> الدوائر الانسيابية
          </span>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {dateStr} <span className="text-cyan-400/60">|</span> <span className="text-cyan-300 font-mono tabular-nums">{timeStr}</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Single-line, clean text) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveView('reception')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
            activeView === 'reception'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          شاشة الاستقبال الرئيسية
        </button>
        <button
          onClick={() => setActiveView('sessions')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
            activeView === 'sessions'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          جدول الحصص والقاعات
        </button>
        <button
          onClick={() => setActiveView('ledger')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
            activeView === 'ledger'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          دفتر اليومية المالي
        </button>
      </nav>

      {/* Zone 3: Reception Stats Summary & Primary Action */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Quick telemetry indicators */}
        <div className="hidden sm:flex items-center gap-3 text-xs bg-[#0b162f] px-3.5 py-1.5 rounded-full border border-slate-800">
          <span className="text-slate-400">الحاضرين: <strong className="text-cyan-400 font-mono tabular-nums">{totalPresent}</strong></span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">التحصيل: <strong className="text-orange-400 font-mono tabular-nums">{totalCollected.toLocaleString()} ج.م</strong></span>
        </div>

        {/* Audio Mute toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`p-2 rounded-full border transition-all ${
            soundEnabled
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-600/40 hover:bg-cyan-900/60'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title={soundEnabled ? 'كتم التنبيهات الصوتية' : 'تفعيل التنبيهات الصوتية'}
          aria-label={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenNewStudent}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-full hover:from-orange-600 hover:to-amber-700 shadow-md shadow-orange-950/50 hover:shadow-orange-500/20 transition-all whitespace-nowrap shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>تسجيل طالب جديد</span>
        </button>
      </div>
    </header>
  );
};

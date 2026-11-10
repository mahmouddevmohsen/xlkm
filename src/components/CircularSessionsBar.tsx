import React from 'react';
import { Session } from '../types';
import { Users, Clock, CheckCircle2, Flame, MapPin } from 'lucide-react';

interface CircularSessionsBarProps {
  sessions: Session[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
}

export const CircularSessionsBar: React.FC<CircularSessionsBarProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
}) => {
  return (
    <section className="relative w-full py-4 px-6 border-b border-cyan-900/30 bg-gradient-to-b from-[#09132b] to-[#070e22] overflow-hidden">
      {/* Subtle background ambient light */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-28 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-28 bg-orange-500/5 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 glow-cyan-sm animate-pulse" />
          <h2 className="text-sm font-bold text-slate-200 tracking-wide">
            الحصص الجارية الآن والقادمة · <span className="text-cyan-400 font-normal">نمط الدوائر المتجاورة</span>
          </h2>
          <span className="text-xs text-slate-400 mr-2">
            (اضغط على دائرة المدرس للتركيز والفلترة المباشرة)
          </span>
        </div>

        {selectedSessionId && (
          <button
            onClick={() => onSelectSession(null)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
          >
            إلغاء التحديد وتصفح جميع الحصص
          </button>
        )}
      </div>

      {/* Horizontal Adjacent Circular Grid / Flow */}
      <div className="flex items-center gap-5 overflow-x-auto pb-3 pt-1 custom-scrollbar scroll-smooth">
        {/* "All Sessions" Circular Button */}
        <button
          onClick={() => onSelectSession(null)}
          className={`group flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 focus:outline-none`}
        >
          <div
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-lg ${
              selectedSessionId === null
                ? 'bg-cyan-950/60 border-cyan-400 glow-cyan-lg scale-105'
                : 'bg-[#0a1530] border-slate-700/80 hover:border-cyan-500/60 hover:scale-102'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-1 text-cyan-300 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-100">كل الحصص</span>
            <span className="text-[10px] text-cyan-400/80 font-mono">الاستقبال العام</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 mt-2">عرض شامل</span>
        </button>

        {/* Circular Session Cards */}
        {sessions.map((sess) => {
          const isSelected = selectedSessionId === sess.id;
          const percentage = Math.round((sess.presentCount / sess.enrolledCount) * 100);
          const circumference = 2 * Math.PI * 46; // Radius ~ 46 for 104px circle
          const strokeDashoffset = circumference - (percentage / 100) * circumference;

          // Theme colors
          const isOrangeTheme = sess.themeColor === 'orange';
          const isAmberTheme = sess.themeColor === 'amber';

          const ringColor = isOrangeTheme
            ? '#f97316'
            : isAmberTheme
            ? '#f59e0b'
            : '#06b6d4';

          const ringGlowClass = isSelected
            ? isOrangeTheme
              ? 'glow-orange-lg border-orange-400'
              : 'glow-cyan-lg border-cyan-400'
            : 'border-slate-800 hover:border-slate-600';

          return (
            <div
              key={sess.id}
              onClick={() => onSelectSession(sess.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectSession(sess.id);
                }
              }}
              className={`group flex-shrink-0 cursor-pointer flex flex-col items-center transition-all duration-300 select-none outline-none ${
                isSelected ? 'scale-105' : 'hover:scale-102 opacity-95 hover:opacity-100'
              }`}
            >
              {/* Prominent Glowing Circular Orb */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG Progress Circle Around Border */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  {/* Track circle */}
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-[#0e2042]/90"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  {/* Active progress */}
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke={ringColor}
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Inner Glowing Teacher Circle */}
                <div
                  className={`w-22 h-22 rounded-full overflow-hidden relative flex flex-col items-center justify-center text-center p-1 border-2 transition-all duration-300 shadow-xl ${ringGlowClass} ${
                    isOrangeTheme
                      ? 'bg-gradient-to-b from-[#1b1716] via-[#101931] to-[#0c142b]'
                      : 'bg-gradient-to-b from-[#0e2340] via-[#091830] to-[#071024]'
                  }`}
                >
                  {/* Background Teacher Photo with high contrast overlay */}
                  <img
                    src={sess.photoUrl}
                    alt={sess.teacherName}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-35 group-hover:opacity-45 transition-opacity"
                  />

                  {/* Gradient Scrim for readable teacher name inside the circle */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/95 via-[#08152e]/80 to-[#071024]/60" />

                  {/* Content inside the luminous circle */}
                  <div className="relative z-10 flex flex-col items-center justify-center px-1">
                    {/* Status indicator mini-icon */}
                    {sess.status === 'active' && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-cyan-300 font-bold mb-0.5 animate-pulse">
                        <Flame className="w-2.5 h-2.5 text-orange-400" />
                        حصة نشطة
                      </span>
                    )}
                    {sess.status === 'ending_soon' && (
                      <span className="text-[9px] text-orange-300 font-bold mb-0.5">
                        أوشكت على الانتهاء
                      </span>
                    )}
                    {sess.status === 'upcoming' && (
                      <span className="text-[9px] text-amber-300 font-bold mb-0.5">
                        تبدأ قريباً
                      </span>
                    )}

                    {/* Teacher's Name - clearly visible & glowing inside the circle */}
                    <span className="text-xs font-extrabold text-white leading-tight drop-shadow-md line-clamp-2 px-1">
                      {sess.teacherName}
                    </span>

                    {/* Attendance count inside the circle */}
                    <span className="mt-1 text-[10px] font-mono font-bold text-cyan-300 tabular-nums">
                      {sess.presentCount} / {sess.enrolledCount} <span className="text-[9px] font-sans text-slate-300">طالب</span>
                    </span>
                  </div>
                </div>

                {/* Percentage Floating Badge */}
                <div
                  className={`absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold shadow-md border ${
                    percentage >= 80
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                      : 'bg-orange-950 text-orange-300 border-orange-500/50'
                  }`}
                >
                  {percentage}%
                </div>
              </div>

              {/* Subtitle Details Under the Circle */}
              <div className="mt-2 text-center max-w-[130px]">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {sess.subject}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <span className="truncate">{sess.hallName}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums text-slate-300">{sess.startTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

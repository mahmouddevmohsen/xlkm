import React from 'react';
import { Session } from '../types';
import { Users, Clock, MapPin, Award, CheckCircle } from 'lucide-react';

interface SessionsOverviewViewProps {
  sessions: Session[];
  onSelectSession: (id: string) => void;
}

export const SessionsOverviewView: React.FC<SessionsOverviewViewProps> = ({
  sessions,
  onSelectSession,
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            جدول الحصص والقاعات التعليمية
            <span className="text-xs bg-cyan-950 text-cyan-300 px-3 py-0.5 rounded-full border border-cyan-800">
              {sessions.length} حصص مجدولة اليوم
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة الطاقة الاستيعابية للقاعات والمدرجات، ونسب الحضور اللحظية لكل مدرس
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((sess) => {
          const pct = Math.round((sess.presentCount / sess.enrolledCount) * 100);
          return (
            <div
              key={sess.id}
              className="bg-[#0a1532] border border-cyan-900/40 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-xl group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-400 overflow-hidden relative shrink-0 glow-cyan-sm">
                  <img
                    src={sess.photoUrl}
                    alt={sess.teacherName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sess.teacherName}
                  </h3>
                  <p className="text-xs text-slate-400">{sess.teacherTitle}</p>
                  <span className="text-[11px] text-cyan-400 font-semibold block mt-0.5">
                    {sess.subject}
                  </span>
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    القاعة والمدرج:
                  </span>
                  <span className="font-semibold text-slate-200">{sess.hallName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    الموعد:
                  </span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {sess.startTime} - {sess.endTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">سعر الحصة / الشهر:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {sess.pricePerSession} ج / {sess.monthlyFee} ج
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">نسبة الإشغال:</span>
                  <span className="font-mono font-bold text-cyan-300">{pct}% ({sess.presentCount} / {sess.enrolledCount})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectSession(sess.id)}
                className="mt-4 w-full py-2 text-xs font-bold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 rounded-xl transition-all"
              >
                تحديد ومتابعة الاستقبال لهذه الحصة
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

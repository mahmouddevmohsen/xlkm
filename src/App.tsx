/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { initialSessions, initialStudents, initialAttendanceRecords } from './data/mockData';
import { Session, Student, AttendanceRecord } from './types';
import { TopBar } from './components/TopBar';
import { CircularSessionsBar } from './components/CircularSessionsBar';
import { CenterQuickStation } from './components/CenterQuickStation';
import { FullWidthAttendanceTable } from './components/FullWidthAttendanceTable';
import { ReceiptModal } from './components/ReceiptModal';
import { NewStudentModal } from './components/NewStudentModal';
import { SessionsOverviewView } from './components/SessionsOverviewView';
import { FinancialLedgerView } from './components/FinancialLedgerView';

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);

  // Active filters and views
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('reception');

  // Modals & Sound
  const [selectedReceipt, setSelectedReceipt] = useState<AttendanceRecord | null>(null);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastCheckedInRecord, setLastCheckedInRecord] = useState<AttendanceRecord | null>(
    initialAttendanceRecords[0] || null
  );

  // Recalculate sessions live presentCount based on attendance records
  const dynamicSessions = useMemo(() => {
    return sessions.map((sess) => {
      const count = attendanceRecords.filter((r) => r.sessionId === sess.id).length;
      return {
        ...sess,
        presentCount: Math.max(sess.presentCount, count),
      };
    });
  }, [sessions, attendanceRecords]);

  // Overall stats
  const totalPresent = attendanceRecords.length;
  const totalCollected = useMemo(() => {
    return attendanceRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  }, [attendanceRecords]);

  // Handle new check-in
  const handleCheckInStudent = (
    data: Omit<AttendanceRecord, 'id' | 'checkInTime' | 'receiptNumber'>
  ) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const receiptNum = `RCP-${Math.floor(8000 + Math.random() * 2000)}`;

    const newRecord: AttendanceRecord = {
      ...data,
      id: `rec-${Date.now()}`,
      checkInTime: timeFormatted,
      receiptNumber: receiptNum,
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    setLastCheckedInRecord(newRecord);

    // If remainingAmount > 0, update student's balanceDue
    if (data.remainingAmount > 0) {
      setStudents((prev) =>
        prev.map((s) => (s.id === data.studentId ? { ...s, balanceDue: data.remainingAmount } : s))
      );
    } else if (data.paymentStatus === 'paid_full') {
      setStudents((prev) =>
        prev.map((s) => (s.id === data.studentId ? { ...s, balanceDue: 0 } : s))
      );
    }
  };

  // Add new student
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  // Toggle payment status
  const handleTogglePaymentStatus = (recordId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        if (r.paymentStatus === 'paid_full') {
          return {
            ...r,
            paymentStatus: 'paid_partial',
            remainingAmount: 40,
            notes: 'تم تعديل السداد إلى متبقي جزئي',
          };
        } else if (r.paymentStatus === 'paid_partial' || r.paymentStatus === 'unpaid') {
          return {
            ...r,
            paymentStatus: 'paid_full',
            amountPaid: r.amountPaid + r.remainingAmount,
            remainingAmount: 0,
            notes: 'تم سداد المتبقي بالكامل في الاستقبال',
          };
        }
        return r;
      })
    );
  };

  // Delete attendance record
  const handleDeleteRecord = (recordId: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Universal Top Navigation Bar */}
      <TopBar
        onOpenNewStudent={() => setIsNewStudentModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        totalPresent={totalPresent}
        totalCollected={totalCollected}
      />

      {/* Main Content Views */}
      {activeView === 'reception' && (
        <main className="flex-1 flex flex-col">
          {/* 2. Top Strip: Ongoing Sessions as Circular Glowing Orbs */}
          <CircularSessionsBar
            sessions={dynamicSessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
          />

          {/* 3. Center Section: Quick Scan Console & Ergonomic Circular Action Dials */}
          <CenterQuickStation
            sessions={dynamicSessions}
            selectedSessionId={selectedSessionId}
            students={students}
            onCheckInStudent={handleCheckInStudent}
            onOpenReceipt={setSelectedReceipt}
            lastCheckedInRecord={lastCheckedInRecord}
          />

          {/* 4. Bottom Section: Full Screen Width Colored Attendance Ledger Table */}
          <FullWidthAttendanceTable
            records={attendanceRecords}
            onOpenReceipt={setSelectedReceipt}
            onDeleteRecord={handleDeleteRecord}
            onTogglePaymentStatus={handleTogglePaymentStatus}
            selectedSessionId={selectedSessionId}
            onClearSessionFilter={() => setSelectedSessionId(null)}
          />
        </main>
      )}

      {activeView === 'sessions' && (
        <main className="flex-1">
          <SessionsOverviewView
            sessions={dynamicSessions}
            onSelectSession={(id) => {
              setSelectedSessionId(id);
              setActiveView('reception');
            }}
          />
        </main>
      )}

      {activeView === 'ledger' && (
        <main className="flex-1">
          <FinancialLedgerView records={attendanceRecords} />
        </main>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        record={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* New Student Registration Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
        sessions={dynamicSessions}
      />
    </div>
  );
}

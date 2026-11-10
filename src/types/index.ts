export type SessionStatus = 'active' | 'upcoming' | 'ending_soon';

export interface Session {
  id: string;
  teacherName: string;
  teacherTitle: string;
  subject: string;
  grade: string;
  hallName: string;
  startTime: string;
  endTime: string;
  enrolledCount: number;
  presentCount: number;
  photoUrl: string;
  status: SessionStatus;
  pricePerSession: number;
  monthlyFee: number;
  themeColor: 'cyan' | 'orange' | 'amber';
}

export type PaymentStatus = 'paid_full' | 'paid_partial' | 'unpaid' | 'exempt';
export type PaymentMethod = 'cash' | 'instapay' | 'card' | 'none';
export type AttendanceState = 'present' | 'late' | 'excused';

export interface Student {
  id: string;
  code: string;
  name: string;
  phone: string;
  parentPhone: string;
  grade: string;
  registeredSessionId: string;
  photoUrl?: string;
  balanceDue: number; // any prior outstanding balance
  note?: string;
  lastSeen?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  sessionId: string;
  teacherName: string;
  subject: string;
  grade: string;
  hallName: string;
  checkInTime: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  attendanceState: AttendanceState;
  notes?: string;
}

export interface ReceptionStats {
  totalPresentToday: number;
  totalCollectedEGP: number;
  pendingDueCount: number;
  activeSessionsCount: number;
}

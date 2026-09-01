export type ConflictType = "TEACHER_CONFLICT" | "CLASS_CONFLICT" | "ROOM_CONFLICT" | "BUSY_SLOT" | "ROOM_TYPE_MISMATCH" | "max_periods_exceeded";

export interface Slot {
  dayOfWeek: number;
  period: number;
}

export interface PlacedEntry {
  id?: string;
  assignmentId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomId?: string | null;
  roomName?: string | null;
  dayOfWeek: number;
  period: number;
  color?: string;
}

export interface Conflict {
  type: ConflictType;
  message: string;
  entryA: PlacedEntry;
  entryB?: PlacedEntry;
}

export interface SoftViolation {
  type: string;
  message: string;
  severity: string;
}

export interface AlgorithmInput {
  assignments: any[];
  busySlots: any[];
  rooms: any[];
  morningPeriods: number;
  afternoonPeriods: number;
  workingDays: number[];
}

export interface ValidationResult {
  conflicts: Conflict[];
  softViolations: SoftViolation[];
  score: number;
  valid: boolean;
}

export interface SchedulableAssignment {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  periodsPerWeek: number;
  roomType: string;
  maxPeriodsPerDay: number;
  isCore?: boolean;
  fixedRoomId?: string | null;
}

export interface AlgorithmResult {
  success: boolean;
  entries: PlacedEntry[];
  unscheduled: any[];
  executionTimeMs: number;
  iterationsCount: number;
  conflicts?: Conflict[];
}

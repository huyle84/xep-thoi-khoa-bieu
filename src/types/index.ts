export type SubjectType = {
  id: string;
  code: string;
  name: string;
  periodsPerWeek: number;
  maxPeriodsPerDay: number;
  roomType: string;
  isCore: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TeacherType = {
  id: string;
  code: string;
  name: string;
  maxPeriodsPerWeek: number;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TeacherBusySlotType = {
  id: string;
  teacherId: string;
  dayOfWeek: number;
  period: number;
  reason: string;
};

export type ClassType = {
  id: string;
  grade: number;
  name: string;
  roomId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RoomType = {
  id: string;
  name: string;
  type: string;
  capacity: number;
};

export type TeachingAssignmentType = {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
  createdAt: Date;
  updatedAt: Date;
  class?: ClassType;
  subject?: SubjectType;
  teacher?: TeacherType;
};

export type ScheduleEntryType = {
  id: string;
  assignmentId: string;
  roomId: string | null;
  dayOfWeek: number;
  period: number;
  weekNumber: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignment?: TeachingAssignmentType;
  room?: RoomType;
};

export type SchoolConfigType = {
  id: string;
  schoolName: string;
  academicYear: string;
  morningPeriods: number;
  afternoonPeriods: number;
  workingDays: string;
};

export type RoomTypeEnum = 'NORMAL' | 'LAB' | 'COMPUTER' | 'GYM';

export type DayOfWeek = 2 | 3 | 4 | 5 | 6 | 7;
export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ConflictType = {
  type: 'TEACHER' | 'CLASS' | 'ROOM' | 'BUSY_SLOT' | 'ROOM_TYPE';
  message: string;
  entryA: ScheduleEntryType;
  entryB?: ScheduleEntryType;
};

export type SoftViolation = {
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type ValidationResult = {
  valid: boolean;
  conflicts: ConflictType[];
  softViolations: SoftViolation[];
};

export type AlgorithmResult = {
  success: boolean;
  entries: ScheduleEntryType[];
  conflicts: ConflictType[];
  unscheduled: string[];
};

export type ScheduleGrid = Map<string, ScheduleEntryType>; // Key format: `${dayOfWeek}-${period}`

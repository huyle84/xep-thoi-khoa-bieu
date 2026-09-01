import { Conflict, PlacedEntry, Slot } from '../algorithms/types';

// Convert DB ScheduleEntry (with nested data) to PlacedEntry for algorithm
export function dbEntryToPlaced(entry: any): PlacedEntry {
  return {
    id: entry.id || `${entry.assignmentId}-${entry.dayOfWeek}-${entry.period}`,
    assignmentId: entry.assignmentId,
    classId: entry.classId || entry.assignment?.classId,
    className: entry.className || entry.assignment?.class?.name,
    subjectId: entry.subjectId || entry.assignment?.subjectId,
    subjectName: entry.subjectName || entry.assignment?.subject?.name,
    teacherId: entry.teacherId || entry.assignment?.teacherId,
    teacherName: entry.teacherName || entry.assignment?.teacher?.name,
    roomId: entry.roomId,
    dayOfWeek: entry.dayOfWeek,
    period: entry.period
  };
}

// Convert PlacedEntry to DB format for saving
export function placedToDbFormat(entry: PlacedEntry, weekNumber: number): object {
  return {
    assignmentId: entry.assignmentId,
    roomId: entry.roomId,
    dayOfWeek: entry.dayOfWeek,
    period: entry.period,
    weekNumber: weekNumber
  };
}

// Get all slots for a given day range and period count
export function getAllSlots(workingDays: number[], totalPeriods: number): Slot[] {
  const slots: Slot[] = [];
  for (const day of workingDays) {
    for (let p = 1; p <= totalPeriods; p++) {
      slots.push({ dayOfWeek: day, period: p });
    }
  }
  return slots;
}

// Group entries by class for display
export function groupByClass(entries: PlacedEntry[]): Record<string, PlacedEntry[]> {
  const grouped: Record<string, PlacedEntry[]> = {};
  for (const entry of entries) {
    if (!grouped[entry.classId]) {
      grouped[entry.classId] = [];
    }
    grouped[entry.classId].push(entry);
  }
  return grouped;
}

// Group entries by teacher for display  
export function groupByTeacher(entries: PlacedEntry[]): Record<string, PlacedEntry[]> {
  const grouped: Record<string, PlacedEntry[]> = {};
  for (const entry of entries) {
    if (!grouped[entry.teacherId]) {
      grouped[entry.teacherId] = [];
    }
    grouped[entry.teacherId].push(entry);
  }
  return grouped;
}

// Get entries for a specific cell in the timetable grid
export function getEntryForCell(
  entries: PlacedEntry[],
  classId: string | null,
  teacherId: string | null,
  dayOfWeek: number,
  period: number
): PlacedEntry | null {
  for (const entry of entries) {
    if (entry.dayOfWeek === dayOfWeek && entry.period === period) {
      if (classId && entry.classId === classId) return entry;
      if (teacherId && entry.teacherId === teacherId) return entry;
    }
  }
  return null;
}

// Calculate teacher workload summary
export function calculateTeacherWorkload(
  entries: PlacedEntry[],
  assignments: any[]
): Record<string, { assigned: number; scheduled: number; max: number }> {
  const workload: Record<string, { assigned: number; scheduled: number; max: number }> = {};
  
  // Tính tổng số tiết được phân công
  for (const assignment of assignments) {
    const tid = assignment.teacherId;
    if (!workload[tid]) workload[tid] = { assigned: 0, scheduled: 0, max: assignment.teacher?.maxPeriods || 24 };
    workload[tid].assigned += assignment.periodsPerWeek;
  }

  // Tính tổng số tiết đã xếp
  for (const entry of entries) {
    const tid = entry.teacherId;
    if (!workload[tid]) workload[tid] = { assigned: 0, scheduled: 0, max: 24 };
    workload[tid].scheduled += 1;
  }

  return workload;
}

// Format conflict message in Vietnamese
export function formatConflictMessage(conflict: Conflict): string {
  switch (conflict.type) {
    case 'TEACHER_CONFLICT':
      return `Trùng giáo viên: ${conflict.entryA.teacherName} (Thứ ${conflict.entryA.dayOfWeek}, Tiết ${conflict.entryA.period})`;
    case 'CLASS_CONFLICT':
      return `Trùng lớp: ${conflict.entryA.className} học nhiều môn cùng lúc (Thứ ${conflict.entryA.dayOfWeek}, Tiết ${conflict.entryA.period})`;
    case 'ROOM_CONFLICT':
      return `Trùng phòng học: Phòng ${conflict.entryA.roomId} được sử dụng bởi nhiều lớp (Thứ ${conflict.entryA.dayOfWeek}, Tiết ${conflict.entryA.period})`;
    case 'BUSY_SLOT':
      return `Giáo viên bận: ${conflict.entryA.teacherName} không thể dạy Thứ ${conflict.entryA.dayOfWeek}, Tiết ${conflict.entryA.period}`;
    case 'ROOM_TYPE_MISMATCH':
      return `Sai loại phòng: Môn ${conflict.entryA.subjectName} cần phòng đặc thù nhưng xếp vào phòng thường`;
    default:
      return conflict.message || 'Xung đột không xác định';
  }
}

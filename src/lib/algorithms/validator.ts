import {
  AlgorithmInput,
  Conflict,
  PlacedEntry,
  SoftViolation,
  ValidationResult
} from './types';

/**
 * Kiểm tra tất cả các ràng buộc cứng và mềm cho toàn bộ thời khóa biểu
 */
export function validateAll(entries: PlacedEntry[], input: AlgorithmInput): ValidationResult {
  const conflicts: Conflict[] = [];
  const softViolations: SoftViolation[] = [];

  // Kiểm tra ràng buộc cứng
  // O(N^2) for checking conflicts
  for (let i = 0; i < entries.length; i++) {
    const entryA = entries[i];

    // HC4: Teacher busy slot
    const isBusy = input.busySlots.some(
      bs => bs.teacherId === entryA.teacherId && bs.dayOfWeek === entryA.dayOfWeek && bs.period === entryA.period
    );
    if (isBusy) {
      conflicts.push({
        type: 'BUSY_SLOT',
        message: `Giáo viên ${entryA.teacherName} bận vào Thứ ${entryA.dayOfWeek}, Tiết ${entryA.period}`,
        entryA
      });
    }

    // HC5: Room type mismatch
    // Assume we can't fully check this without assignment data, but if room is assigned, we check room type against subject requirements.
    // Tránh kiểm tra trùng lặp, giả định assignment.roomType đã được map trong hàm checkSinglePlacement

    for (let j = i + 1; j < entries.length; j++) {
      const entryB = entries[j];

      // Chỉ kiểm tra khi cùng thứ và tiết
      if (entryA.dayOfWeek === entryB.dayOfWeek && entryA.period === entryB.period) {
        
        // HC1: Teacher conflict
        if (entryA.teacherId === entryB.teacherId) {
          conflicts.push({
            type: 'TEACHER_CONFLICT',
            message: `Giáo viên ${entryA.teacherName} dạy 2 lớp ${entryA.className} và ${entryB.className} cùng lúc`,
            entryA,
            entryB
          });
        }

        // HC2: Class conflict
        if (entryA.classId === entryB.classId) {
          conflicts.push({
            type: 'CLASS_CONFLICT',
            message: `Lớp ${entryA.className} học 2 môn ${entryA.subjectName} và ${entryB.subjectName} cùng lúc`,
            entryA,
            entryB
          });
        }

        // HC3: Room conflict
        if (entryA.roomId && entryB.roomId && entryA.roomId === entryB.roomId) {
          conflicts.push({
            type: 'ROOM_CONFLICT',
            message: `Phòng ${entryA.roomId} được xếp cho cả lớp ${entryA.className} và ${entryB.className}`,
            entryA,
            entryB
          });
        }
      }
    }
  }

  // Khôi phục assignment từ input để check ràng buộc mềm và HC5
  const assignmentMap = new Map(input.assignments.map(a => [a.id, a]));
  const roomMap = new Map(input.rooms.map(r => [r.id, r]));

  // Re-check HC5 & evaluate soft constraints
  const teacherDayPeriods = new Map<string, number[]>();
  const classSubjectDayCount = new Map<string, number>();

  entries.forEach(entry => {
    const assignment = assignmentMap.get(entry.assignmentId);
    if (assignment) {
      // HC5: Room Type Mismatch
      if (entry.roomId) {
        const room = roomMap.get(entry.roomId);
        if (room && room.type !== assignment.roomType) {
          // Allow NORMAL room for NORMAL subject, but if LAB requires LAB, conflict.
          // Simplification: room type must exactly match or subject roomType is 'NORMAL'
          if (assignment.roomType !== 'NORMAL' && room.type !== assignment.roomType) {
             conflicts.push({
              type: 'ROOM_TYPE_MISMATCH',
              message: `Môn ${entry.subjectName} cần phòng ${assignment.roomType} nhưng xếp vào phòng ${room.type}`,
              entryA: entry
             });
          }
        }
      }

      // SC2: Core subjects should be early
      if (assignment.isCore) {
        const isMorningEarly = entry.period >= 1 && entry.period <= 3;
        const isAfternoonEarly = entry.period >= 6 && entry.period <= 8;
        if (!isMorningEarly && !isAfternoonEarly) {
          softViolations.push({
            type: 'CORE_PERIOD',
            message: `Môn cốt lõi ${entry.subjectName} xếp vào tiết muộn (Thứ ${entry.dayOfWeek}, Tiết ${entry.period})`,
            severity: 'MEDIUM'
          });
        }
      }

      // Track SC3: Max periods per day
      const classSubjDayKey = `${entry.classId}-${entry.subjectId}-${entry.dayOfWeek}`;
      classSubjectDayCount.set(classSubjDayKey, (classSubjectDayCount.get(classSubjDayKey) || 0) + 1);
      if ((classSubjectDayCount.get(classSubjDayKey) || 0) > assignment.maxPeriodsPerDay) {
         softViolations.push({
           type: 'MAX_DAILY',
           message: `Lớp ${entry.className} học môn ${entry.subjectName} quá ${assignment.maxPeriodsPerDay} tiết trong Thứ ${entry.dayOfWeek}`,
           severity: 'HIGH'
         });
      }
    }

    // Track SC1: Teacher gap
    const teacherDayKey = `${entry.teacherId}-${entry.dayOfWeek}`;
    if (!teacherDayPeriods.has(teacherDayKey)) teacherDayPeriods.set(teacherDayKey, []);
    teacherDayPeriods.get(teacherDayKey)!.push(entry.period);
  });

  // Check SC1: Gaps
  teacherDayPeriods.forEach((periods, teacherDayKey) => {
    if (periods.length <= 1) return;
    periods.sort((a, b) => a - b);
    let gaps = 0;
    for (let i = 1; i < periods.length; i++) {
      if (periods[i] - periods[i - 1] > 1) {
        gaps += (periods[i] - periods[i - 1] - 1);
      }
    }
    if (gaps > 0) {
      const [teacherId, day] = teacherDayKey.split('-');
      softViolations.push({
        type: 'GAP',
        message: `Giáo viên có ${gaps} tiết trống trong Thứ ${day}`,
        severity: gaps > 1 ? 'HIGH' : 'LOW'
      });
    }
  });

  const valid = conflicts.length === 0;
  const score = calculateScore(entries, softViolations);

  return { valid, conflicts, softViolations, score };
}

/**
 * Kiểm tra xung đột khi thêm một mục mới vào TKB hiện tại (dùng cho kéo thả)
 */
export function checkSinglePlacement(newEntry: PlacedEntry, existingEntries: PlacedEntry[], input: AlgorithmInput): Conflict[] {
  const conflicts: Conflict[] = [];

  // HC4
  const isBusy = input.busySlots.some(
    bs => bs.teacherId === newEntry.teacherId && bs.dayOfWeek === newEntry.dayOfWeek && bs.period === newEntry.period
  );
  if (isBusy) {
    conflicts.push({
      type: 'BUSY_SLOT',
      message: `Giáo viên ${newEntry.teacherName} bận vào Thứ ${newEntry.dayOfWeek}, Tiết ${newEntry.period}`,
      entryA: newEntry
    });
  }

  // HC5
  const assignment = input.assignments.find(a => a.id === newEntry.assignmentId);
  const room = input.rooms.find(r => r.id === newEntry.roomId);
  if (assignment && room && assignment.roomType !== 'NORMAL' && room.type !== assignment.roomType) {
    conflicts.push({
      type: 'ROOM_TYPE_MISMATCH',
      message: `Môn ${newEntry.subjectName} cần phòng ${assignment.roomType} nhưng xếp vào phòng ${room.type}`,
      entryA: newEntry
    });
  }

  // Tương quan với các entry khác
  for (const entry of existingEntries) {
    if (entry.dayOfWeek === newEntry.dayOfWeek && entry.period === newEntry.period) {
      if (entry.teacherId === newEntry.teacherId) {
        conflicts.push({
          type: 'TEACHER_CONFLICT',
          message: `Giáo viên ${newEntry.teacherName} dạy 2 lớp ${newEntry.className} và ${entry.className} cùng lúc`,
          entryA: newEntry,
          entryB: entry
        });
      }

      if (entry.classId === newEntry.classId) {
        conflicts.push({
          type: 'CLASS_CONFLICT',
          message: `Lớp ${newEntry.className} học 2 môn ${newEntry.subjectName} và ${entry.subjectName} cùng lúc`,
          entryA: newEntry,
          entryB: entry
        });
      }

      if (entry.roomId && newEntry.roomId && entry.roomId === newEntry.roomId) {
        conflicts.push({
          type: 'ROOM_CONFLICT',
          message: `Phòng ${newEntry.roomId} được xếp cho cả lớp ${newEntry.className} và ${entry.className}`,
          entryA: newEntry,
          entryB: entry
        });
      }
    }
  }

  return conflicts;
}

/**
 * Tính điểm cho TKB (từ 0-100) dựa trên số lượng và mức độ vi phạm mềm
 */
export function calculateScore(entries: PlacedEntry[], violations: SoftViolation[]): number {
  if (entries.length === 0) return 100;
  
  let penalty = 0;
  for (const v of violations) {
    switch (v.severity) {
      case 'HIGH': penalty += 10; break;
      case 'MEDIUM': penalty += 5; break;
      case 'LOW': penalty += 2; break;
    }
  }

  // Base score 100
  const score = Math.max(0, 100 - penalty);
  return score;
}

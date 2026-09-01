import {
  AlgorithmInput,
  AlgorithmResult,
  Conflict,
  PlacedEntry,
  SchedulableAssignment,
  Slot
} from './types';
import { checkSinglePlacement, validateAll } from './validator';

const MAX_ITERATIONS = 50000;
const TIMEOUT_MS = 30000;

export async function generateSchedule(input: AlgorithmInput): Promise<AlgorithmResult> {
  const startTime = Date.now();
  const placed: PlacedEntry[] = [];
  const state = { iterations: 0 };
  
  // 1. Sắp xếp các assignments theo độ khó (Constraint Density)
  const sortedAssignments = sortAssignmentsByConstraint(input.assignments, input);

  // 2. Chạy Backtracking
  const success = backtrack(sortedAssignments, 0, 0, placed, input, state, startTime);

  // 3. Fallback Greedy nếu backtracking thất bại hoặc timeout
  const unscheduled: string[] = [];
  let finalEntries = [...placed];
  
  if (!success) {
    // Collect what wasn't scheduled and try greedy placement
    const placedAssignmentCounts = new Map<string, number>();
    for (const p of placed) {
      placedAssignmentCounts.set(p.assignmentId, (placedAssignmentCounts.get(p.assignmentId) || 0) + 1);
    }

    for (const assignment of sortedAssignments) {
      const currentCount = placedAssignmentCounts.get(assignment.id) || 0;
      const needed = assignment.periodsPerWeek - currentCount;
      
      if (needed > 0) {
        unscheduled.push(assignment.id); // Vẫn báo là unscheduled
        
        // Greedy placement (bỏ qua một số constraint nếu cần thiết - ở đây chỉ tìm chỗ trống tương đối)
        for (let i = 0; i < needed; i++) {
           const slots = getAvailableSlots(assignment, finalEntries, input);
           if (slots.length > 0) {
             const bestSlot = slots[0];
             const roomId = selectRoom(assignment, bestSlot, finalEntries, input.rooms);
             finalEntries.push({
               id: `temp-${assignment.id}-${bestSlot.dayOfWeek}-${bestSlot.period}`,
               assignmentId: assignment.id,
               classId: assignment.classId,
               className: assignment.className,
               subjectId: assignment.subjectId,
               subjectName: assignment.subjectName,
               teacherId: assignment.teacherId,
               teacherName: assignment.teacherName,
               roomId: roomId,
               dayOfWeek: bestSlot.dayOfWeek,
               period: bestSlot.period
             });
           }
        }
      }
    }
  }

  const executionTimeMs = Date.now() - startTime;
  
  // Final validation
  const validationResult = validateAll(finalEntries, input);

  return {
    success: success && unscheduled.length === 0,
    entries: finalEntries,
    conflicts: validationResult.conflicts,
    unscheduled,
    executionTimeMs,
    iterationsCount: state.iterations
  };
}

/**
 * Hàm Backtracking chính
 */
function backtrack(
  assignments: SchedulableAssignment[],
  assignmentIndex: number,
  periodIndex: number,
  placed: PlacedEntry[],
  input: AlgorithmInput,
  state: { iterations: number },
  startTime: number
): boolean {
  state.iterations++;

  // Điều kiện dừng: Limit iterations hoặc timeout
  if (state.iterations > MAX_ITERATIONS) return false;
  if (Date.now() - startTime > TIMEOUT_MS) return false;

  // Nếu đã xếp xong tất cả các assignment
  if (assignmentIndex >= assignments.length) {
    return true;
  }

  const assignment = assignments[assignmentIndex];

  // Nếu đã xếp đủ số tiết cho assignment hiện tại, chuyển sang assignment tiếp theo
  if (periodIndex >= assignment.periodsPerWeek) {
    return backtrack(assignments, assignmentIndex + 1, 0, placed, input, state, startTime);
  }

  // Lấy danh sách các slot khả dụng cho assignment hiện tại
  const availableSlots = getAvailableSlots(assignment, placed, input);
  
  // Sắp xếp slot theo điểm ưu tiên (Least Constraining Value - LCV hoặc Heuristic ưu tiên)
  availableSlots.sort((a, b) => scoreSlot(b, assignment, placed) - scoreSlot(a, assignment, placed));

  for (const slot of availableSlots) {
    const roomId = selectRoom(assignment, slot, placed, input.rooms);
    
    const entry: PlacedEntry = {
      id: `temp-${assignment.id}-${slot.dayOfWeek}-${slot.period}`,
      assignmentId: assignment.id,
      classId: assignment.classId,
      className: assignment.className,
      subjectId: assignment.subjectId,
      subjectName: assignment.subjectName,
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      roomId: roomId || assignment.fixedRoomId || null,
      dayOfWeek: slot.dayOfWeek,
      period: slot.period
    };

    // Kiểm tra nhanh conflict
    const conflicts = checkSinglePlacement(entry, placed, input);
    
    if (conflicts.length === 0) {
      placed.push(entry);
      
      // Đệ quy xếp tiết tiếp theo
      if (backtrack(assignments, assignmentIndex, periodIndex + 1, placed, input, state, startTime)) {
        return true;
      }
      
      // Backtrack
      placed.pop();
    }
  }

  return false;
}

/**
 * Sắp xếp các assignments: Xếp những assignment khó nhất trước (Most Constrained Variable)
 * Ưu tiên: Số tiết nhiều, Môn chuyên/thực hành cần phòng đặc biệt, Giáo viên bận nhiều
 */
function sortAssignmentsByConstraint(assignments: SchedulableAssignment[], input: AlgorithmInput): SchedulableAssignment[] {
  return [...assignments].sort((a, b) => {
    // 1. Giáo viên bận nhiều hơn
    const busyA = input.busySlots.filter(bs => bs.teacherId === a.teacherId).length;
    const busyB = input.busySlots.filter(bs => bs.teacherId === b.teacherId).length;
    if (busyA !== busyB) return busyB - busyA;

    // 2. Yêu cầu phòng đặc biệt
    if (a.roomType !== 'NORMAL' && b.roomType === 'NORMAL') return -1;
    if (a.roomType === 'NORMAL' && b.roomType !== 'NORMAL') return 1;

    // 3. Số tiết học nhiều hơn
    return b.periodsPerWeek - a.periodsPerWeek;
  });
}

/**
 * Lấy danh sách các slot trống khả dụng cho một assignment
 */
function getAvailableSlots(assignment: SchedulableAssignment, placed: PlacedEntry[], input: AlgorithmInput): Slot[] {
  const slots: Slot[] = [];
  const totalPeriods = input.morningPeriods + input.afternoonPeriods;

  for (const day of input.workingDays) {
    for (let p = 1; p <= totalPeriods; p++) {
      // Bỏ qua nếu giáo viên bận
      const isBusy = input.busySlots.some(bs => bs.teacherId === assignment.teacherId && bs.dayOfWeek === day && bs.period === p);
      if (isBusy) continue;

      slots.push({ dayOfWeek: day, period: p });
    }
  }
  return slots;
}

/**
 * Đánh giá điểm ưu tiên cho một slot (phục vụ Soft Constraints)
 * Càng cao càng tốt
 */
function scoreSlot(slot: Slot, assignment: SchedulableAssignment, placed: PlacedEntry[]): number {
  let score = 100;

  // SC2: Core subjects ưu tiên xếp tiết đầu
  if (assignment.isCore) {
    const isMorningEarly = slot.period >= 1 && slot.period <= 3;
    const isAfternoonEarly = slot.period >= 6 && slot.period <= 8;
    if (isMorningEarly || isAfternoonEarly) {
      score += 50;
    } else {
      score -= 30;
    }
  }

  // Tránh xếp cùng 1 môn quá nhiều trong 1 ngày (SC3)
  const sameDayEntries = placed.filter(p => p.classId === assignment.classId && p.subjectId === assignment.subjectId && p.dayOfWeek === slot.dayOfWeek);
  if (sameDayEntries.length >= assignment.maxPeriodsPerDay) {
    score -= 1000; // Phạt nặng
  } else if (sameDayEntries.length > 0) {
    // Thích xếp liên tiếp (khác tiết kề nhau)
    const adjacent = sameDayEntries.some(p => Math.abs(p.period - slot.period) === 1);
    if (adjacent) score += 20;
  }

  // SC1: Tránh khoảng trống cho giáo viên
  const teacherSameDay = placed.filter(p => p.teacherId === assignment.teacherId && p.dayOfWeek === slot.dayOfWeek);
  if (teacherSameDay.length > 0) {
    const gaps = teacherSameDay.some(p => Math.abs(p.period - slot.period) === 2); // tạo ra 1 tiết trống
    if (gaps) score -= 20;
    const adjacent = teacherSameDay.some(p => Math.abs(p.period - slot.period) === 1);
    if (adjacent) score += 30;
  }

  return score;
}

/**
 * Chọn phòng học phù hợp nhất
 */
function selectRoom(assignment: SchedulableAssignment, slot: Slot, placed: PlacedEntry[], rooms: AlgorithmInput['rooms']): string | null {
  if (assignment.fixedRoomId) return assignment.fixedRoomId;

  // Lọc ra các phòng trống trong slot này
  const usedRooms = new Set(placed.filter(p => p.dayOfWeek === slot.dayOfWeek && p.period === slot.period && p.roomId).map(p => p.roomId));
  
  const availableRooms = rooms.filter(r => !usedRooms.has(r.id));
  
  // Ưu tiên phòng đúng loại
  const matchingTypeRooms = availableRooms.filter(r => r.type === assignment.roomType);
  if (matchingTypeRooms.length > 0) {
    return matchingTypeRooms[0].id; // Lấy phòng đầu tiên khớp
  }
  
  // Nếu không yêu cầu phòng đặc biệt, có thể lấy phòng NORMAL
  if (assignment.roomType === 'NORMAL' && availableRooms.length > 0) {
    return availableRooms[0].id;
  }

  return null; // Không có phòng phù hợp
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  
  // Clean up
  await prisma.scheduleEntry.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.teacherBusySlot.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.room.deleteMany();
  await prisma.schoolConfig.deleteMany();

  // 1. Config
  await prisma.schoolConfig.create({
    data: {
      schoolName: 'Trường THPT Chuyên',
      academicYear: '2025-2026',
      morningPeriods: 5,
      afternoonPeriods: 5,
      workingDays: '2,3,4,5,6,7',
    },
  });

  // 2. Rooms
  const room101 = await prisma.room.create({
    data: { name: 'Phòng 101', type: 'NORMAL', capacity: 45 },
  });
  const roomComputer = await prisma.room.create({
    data: { name: 'Phòng Tin học', type: 'COMPUTER', capacity: 40 },
  });
  const roomGym = await prisma.room.create({
    data: { name: 'Phòng Thể dục', type: 'GYM', capacity: 100 },
  });

  // 3. Subjects
  const subjMath = await prisma.subject.create({
    data: { code: 'TOAN', name: 'Toán', periodsPerWeek: 4, maxPeriodsPerDay: 2, isCore: true, color: '#ef4444' }
  });
  const subjLit = await prisma.subject.create({
    data: { code: 'VAN', name: 'Ngữ Văn', periodsPerWeek: 4, maxPeriodsPerDay: 2, isCore: true, color: '#eab308' }
  });
  const subjEng = await prisma.subject.create({
    data: { code: 'ANH', name: 'Tiếng Anh', periodsPerWeek: 3, maxPeriodsPerDay: 1, isCore: true, color: '#3b82f6' }
  });
  const subjPhys = await prisma.subject.create({
    data: { code: 'LY', name: 'Vật Lý', periodsPerWeek: 2, maxPeriodsPerDay: 1, color: '#8b5cf6' }
  });
  const subjChem = await prisma.subject.create({
    data: { code: 'HOA', name: 'Hóa Học', periodsPerWeek: 2, maxPeriodsPerDay: 1, color: '#10b981' }
  });
  const subjBio = await prisma.subject.create({
    data: { code: 'SINH', name: 'Sinh Học', periodsPerWeek: 2, maxPeriodsPerDay: 1, color: '#14b8a6' }
  });
  const subjPE = await prisma.subject.create({
    data: { code: 'TD', name: 'Thể Dục', periodsPerWeek: 2, maxPeriodsPerDay: 1, roomType: 'GYM', color: '#f97316' }
  });
  const subjIT = await prisma.subject.create({
    data: { code: 'TIN', name: 'Tin Học', periodsPerWeek: 2, maxPeriodsPerDay: 1, roomType: 'COMPUTER', color: '#64748b' }
  });

  // 4. Teachers
  const teacherMath = await prisma.teacher.create({ data: { code: 'GV01', name: 'Nguyễn Văn Toán', maxPeriodsPerWeek: 20 } });
  const teacherLit = await prisma.teacher.create({ data: { code: 'GV02', name: 'Trần Thị Văn', maxPeriodsPerWeek: 20 } });
  const teacherEng = await prisma.teacher.create({ data: { code: 'GV03', name: 'Lê Tiếng Anh', maxPeriodsPerWeek: 20 } });
  const teacherPhys = await prisma.teacher.create({ data: { code: 'GV04', name: 'Phạm Vật Lý', maxPeriodsPerWeek: 20 } });
  const teacherChem = await prisma.teacher.create({ data: { code: 'GV05', name: 'Hoàng Hóa Học', maxPeriodsPerWeek: 20 } });
  const teacherBio = await prisma.teacher.create({ data: { code: 'GV06', name: 'Đỗ Sinh Học', maxPeriodsPerWeek: 20 } });
  const teacherPE = await prisma.teacher.create({ data: { code: 'GV07', name: 'Ngô Thể Dục', maxPeriodsPerWeek: 20 } });
  const teacherIT = await prisma.teacher.create({ data: { code: 'GV08', name: 'Vũ Tin Học', maxPeriodsPerWeek: 20 } });

  // 5. Classes
  const class10A = await prisma.class.create({ data: { grade: 10, name: '10A', roomId: room101.id } });
  const class10B = await prisma.class.create({ data: { grade: 10, name: '10B' } });
  const class11A = await prisma.class.create({ data: { grade: 11, name: '11A' } });

  // 6. Teaching Assignments
  const createAssignments = async (cls: any) => {
    await prisma.teachingAssignment.createMany({
      data: [
        { classId: cls.id, subjectId: subjMath.id, teacherId: teacherMath.id, periodsPerWeek: 4 },
        { classId: cls.id, subjectId: subjLit.id, teacherId: teacherLit.id, periodsPerWeek: 4 },
        { classId: cls.id, subjectId: subjEng.id, teacherId: teacherEng.id, periodsPerWeek: 3 },
        { classId: cls.id, subjectId: subjPhys.id, teacherId: teacherPhys.id, periodsPerWeek: 2 },
        { classId: cls.id, subjectId: subjChem.id, teacherId: teacherChem.id, periodsPerWeek: 2 },
        { classId: cls.id, subjectId: subjBio.id, teacherId: teacherBio.id, periodsPerWeek: 2 },
        { classId: cls.id, subjectId: subjPE.id, teacherId: teacherPE.id, periodsPerWeek: 2 },
        { classId: cls.id, subjectId: subjIT.id, teacherId: teacherIT.id, periodsPerWeek: 2 },
      ]
    });
  };

  await createAssignments(class10A);
  await createAssignments(class10B);
  await createAssignments(class11A);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

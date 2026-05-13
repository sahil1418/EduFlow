import { PrismaClient, Role, Board } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.upsert({
    where: { subdomain: 'springfield' },
    update: {},
    create: {
      name: 'Springfield Public School',
      subdomain: 'springfield',
      board: Board.CBSE,
      email: 'admin@springfield.eduflow.local',
    },
  });

  const year = await prisma.academicYear.upsert({
    where: { schoolId_label: { schoolId: school.id, label: '2025-2026' } },
    update: {},
    create: {
      schoolId: school.id,
      label: '2025-2026',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-04-30'),
      isCurrent: true,
    },
  });

  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: 'admin@springfield.eduflow.local' } },
    update: {},
    create: {
      schoolId: school.id,
      role: Role.SUPER_ADMIN,
      email: 'admin@springfield.eduflow.local',
      name: 'Principal',
      password,
    },
  });

  const class10 = await prisma.class.upsert({
    where: { schoolId_academicYearId_grade: { schoolId: school.id, academicYearId: year.id, grade: 10 } },
    update: {},
    create: { schoolId: school.id, academicYearId: year.id, grade: 10, label: 'Grade 10' },
  });

  await prisma.section.upsert({
    where: { classId_name: { classId: class10.id, name: 'A' } },
    update: {},
    create: { schoolId: school.id, classId: class10.id, name: 'A' },
  });

  console.log('seed complete. login: admin@springfield.eduflow.local / admin123');
}

main().finally(() => prisma.$disconnect());

import { PrismaClient, Role, Board } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =====================================================================
// Config
// =====================================================================

const TARGET_SUBDOMAIN = process.env.SEED_SUBDOMAIN || 'springfield';
const TARGET_SCHOOL_NAME = process.env.SEED_SCHOOL_NAME || 'Springfield Public School';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || `admin@${TARGET_SUBDOMAIN}.eduflow.local`;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';

const YEAR_LABEL = '2026-2027';
const YEAR_START = new Date('2026-04-01');
const YEAR_END   = new Date('2027-03-31');

const STUDENTS_PER_SECTION = 30;

/** Indian school structure: 9 + 10 are single-section, 11 + 12 split into 4 streams. */
const STREAMS = [
  { code: 'SCI-M', label: 'Science (Maths)' },
  { code: 'SCI-B', label: 'Science (Biology)' },
  { code: 'COMM',  label: 'Commerce' },
  { code: 'ARTS',  label: 'Arts' },
];

// =====================================================================
// Name pools — Indian first + last names (enough for 300+ unique combos)
// =====================================================================

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Aryan', 'Dhruv', 'Kabir', 'Riaan', 'Rohan', 'Yash',
  'Veer', 'Rudra', 'Ayaan', 'Vivaan', 'Ansh', 'Karan', 'Neel', 'Tanish',
  'Aanya', 'Anaya', 'Saanvi', 'Diya', 'Pari', 'Myra', 'Anika', 'Aaradhya',
  'Ananya', 'Aadhya', 'Shanaya', 'Kiara', 'Mahika', 'Ira', 'Ridhima', 'Vanya',
  'Navya', 'Avni', 'Riya', 'Tara', 'Zara', 'Esha', 'Kavya', 'Anvi',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Mehta', 'Reddy', 'Gupta',
  'Iyer', 'Nair', 'Rao', 'Chopra', 'Joshi', 'Kapoor', 'Saxena', 'Agarwal',
  'Bhat', 'Desai', 'Khanna', 'Malhotra', 'Pandey', 'Roy', 'Sen', 'Trivedi',
  'Banerjee',
];

function nameFor(i: number): string {
  const f = FIRST_NAMES[i % FIRST_NAMES.length];
  const l = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${f} ${l}`;
}

// =====================================================================
// Main
// =====================================================================

async function main() {
  console.log(`\n🏫  Seeding school "${TARGET_SCHOOL_NAME}" (${TARGET_SUBDOMAIN})\n`);

  // ---- 1. School + admin ----
  const school = await prisma.school.upsert({
    where: { subdomain: TARGET_SUBDOMAIN },
    update: {},
    create: {
      name: TARGET_SCHOOL_NAME,
      subdomain: TARGET_SUBDOMAIN,
      board: Board.CBSE,
      email: ADMIN_EMAIL,
    },
  });

  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: ADMIN_EMAIL } },
    update: { password: adminHash },
    create: {
      schoolId: school.id,
      role: Role.SUPER_ADMIN,
      email: ADMIN_EMAIL,
      name: 'Principal',
      password: adminHash,
    },
  });
  console.log(`  ✓ School + admin (${ADMIN_EMAIL} / ${ADMIN_PASSWORD})`);

  // ---- 2. Academic year (April 2026 → March 2027) ----
  // Demote any previously-current year so isCurrent stays single.
  await prisma.academicYear.updateMany({
    where: { schoolId: school.id, isCurrent: true },
    data: { isCurrent: false },
  });

  const year = await prisma.academicYear.upsert({
    where: { schoolId_label: { schoolId: school.id, label: YEAR_LABEL } },
    update: { startDate: YEAR_START, endDate: YEAR_END, isCurrent: true },
    create: {
      schoolId: school.id,
      label: YEAR_LABEL,
      startDate: YEAR_START,
      endDate: YEAR_END,
      isCurrent: true,
    },
  });
  console.log(`  ✓ Academic year ${YEAR_LABEL} (${YEAR_START.toISOString().slice(0, 10)} → ${YEAR_END.toISOString().slice(0, 10)})`);

  // ---- 3. Wipe prior student/class data so this seed is idempotent ----
  console.log('  • Wiping existing classes / sections / students for this school…');
  await prisma.attendanceRecord.deleteMany({ where: { schoolId: school.id } });
  await prisma.examMark.deleteMany({ where: { schoolId: school.id } });
  await prisma.submission.deleteMany({ where: { schoolId: school.id } });
  await prisma.parentLink.deleteMany({
    where: { student: { schoolId: school.id } },
  });
  await prisma.user.deleteMany({
    where: { schoolId: school.id, role: Role.STUDENT },
  });
  await prisma.classSubject.deleteMany({ where: { schoolId: school.id } });
  await prisma.section.deleteMany({ where: { schoolId: school.id } });
  await prisma.class.deleteMany({ where: { schoolId: school.id, academicYearId: year.id } });

  // ---- 4. Create classes + sections + students ----
  let globalNameIdx = 0;
  let totalStudents = 0;

  for (const grade of [9, 10, 11, 12]) {
    const cls = await prisma.class.create({
      data: {
        schoolId: school.id,
        academicYearId: year.id,
        grade,
        label: `Grade ${grade}`,
      },
    });

    const sectionDefs =
      grade <= 10
        ? [{ name: 'A', display: `Class ${grade} — Section A` }]
        : STREAMS.map((s) => ({ name: s.code, display: `Class ${grade} — ${s.label}` }));

    for (const sectionDef of sectionDefs) {
      const section = await prisma.section.create({
        data: {
          schoolId: school.id,
          classId: cls.id,
          name: sectionDef.name,
        },
      });

      const students = await prisma.$transaction(
        Array.from({ length: STUDENTS_PER_SECTION }, (_, i) => {
          const roll = String(i + 1).padStart(2, '0');
          const rollNumber = `${grade}${sectionDef.name}${roll}`;
          return prisma.user.create({
            data: {
              schoolId: school.id,
              sectionId: section.id,
              role: Role.STUDENT,
              name: nameFor(globalNameIdx++),
              rollNumber,
            },
            select: { id: true },
          });
        }),
      );

      totalStudents += students.length;
      console.log(`     ${sectionDef.display.padEnd(34)} ${students.length} students`);
    }
  }

  console.log(`\n✅  Seeded ${totalStudents} students across grades 9-12`);
  console.log(`    Sign in: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`    Subdomain: ${TARGET_SUBDOMAIN}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

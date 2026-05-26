/// <reference types="node" />
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Rozpoczynanie zasiedlania bazy danych...');


  await prisma.planEntry.deleteMany({});
  await prisma.trainingPlan.deleteMany({});
  await prisma.calendarEntry.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.trainerUserRelation.deleteMany({});
  await prisma.clubEntry.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('hashed_password_123', 10);

  const ex1 = await prisma.exercise.create({
    data: {
      name: 'Wyciskanie sztangi na ławce płaskiej',
      category: 'Klatka piersiowa',
      muscleParts: ['Klatka piersiowa', 'Triceps'],
      level: 'Średni',
      videoUrl: 'https://youtube.com/watch?v=example1',
      description: 'Podstawowe ćwiczenie wielostawowe rozwijające siłę klatki piersiowej.'
    }
  });

  const ex2 = await prisma.exercise.create({
    data: {
      name: 'Przysiad ze sztangą',
      category: 'Nogi',
      muscleParts: ['Czworogłowy ud', 'Pośladkowy wielki'],
      level: 'Zaawansowany',
      videoUrl: 'https://youtube.com/watch?v=example2',
      description: 'Kompleksowe ćwiczenie dolnych partii ciała.'
    }
  });

  console.log('Utworzono bazowe ćwiczenia.');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@olympo.pl',
      password: hashedPassword,
      firstName: 'Tomasz',
      lastName: 'Wiśniewski',
      role: Role.ADMIN,
    }
  });

  const trainer = await prisma.user.create({
    data: {
      email: 'anna.kowalska@olympo.pl',
      password: hashedPassword,
      firstName: 'Anna',
      lastName: 'Kowalska',
      role: Role.TRAINER,
    }
  });

  const client = await prisma.user.create({
    data: {
      email: 'jan.kowalski@gmail.com',
      password: hashedPassword,
      firstName: 'Jan',
      lastName: 'Kowalski',
      role: Role.CLIENT,
      qrCode: 'JK2026-0512',
    }
  });

  console.log('Utworzono konta użytkowników.');

  const relation = await prisma.trainerUserRelation.create({
    data: {
      clientId: client.id,
      trainerId: trainer.id,
    }
  });

  const plan = await prisma.trainingPlan.create({
    data: {
      relationId: relation.id,
      title: 'Plan Redukcji - Maj 2026',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-31'),
      progress: 60,
    }
  });

  await prisma.planEntry.create({
    data: {
      trainingPlanId: plan.id,
      exerciseId: ex1.id,
      dayOfWeek: 'Poniedziałek',
      setsCount: 4,
      repsRange: '8-12',
      weight: 85.0
    }
  });

  await prisma.clubEntry.create({
    data: {
      userId: client.id,
      status: 'AUTHORIZED',
    }
  });

  console.log('Zasiedlanie bazy zakończone sukcesem!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
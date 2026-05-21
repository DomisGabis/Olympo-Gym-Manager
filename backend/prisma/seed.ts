/// <reference types="node" />
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt'; // 1. DODAJ IMPORT BCRYPT

const prisma = new PrismaClient();

async function main() {
  console.log('Rozpoczynanie zasiedlania bazy danych...');

// 1. Czyszczenie starych danych (w bezpiecznej kolejności od dzieci do rodziców)
  await prisma.planEntry.deleteMany({});
  await prisma.trainingPlan.deleteMany({});
  await prisma.calendarEntry.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.trainerUserRelation.deleteMany({});
  await prisma.clubEntry.deleteMany({});
  await prisma.membership.deleteMany({}); // Czyszczenie nowej tabeli karnetów
  await prisma.exercise.deleteMany({});   // Teraz bez problemu usunie ćwiczenia
  await prisma.user.deleteMany({});       // I na końcu użytkowników

  // 2. WYGENEROWANIE PRAWDZIWEGO HASHA DLA HASŁA TESTOWEGO
  // Liczba 10 to tzw. saltRounds (standardowa siła szyfrowania)
  const hashedPassword = await bcrypt.hash('hashed_password_123', 10);

  // 3. Tworzenie podstawowych ćwiczeń
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

  // 4. Tworzenie użytkowników testowych (UŻYWAMY WYGENEROWANEGO HASHED_PASSWORD)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@olympo.pl',
      password: hashedPassword, // <-- POPRAWIONO Z 'hashed_password_123'
      firstName: 'Tomasz',
      lastName: 'Wiśniewski',
      role: Role.ADMIN,
    }
  });

  const trainer = await prisma.user.create({
    data: {
      email: 'anna.kowalska@olympo.pl',
      password: hashedPassword, // <-- POPRAWIONO
      firstName: 'Anna',
      lastName: 'Kowalska',
      role: Role.TRAINER,
    }
  });

  const client = await prisma.user.create({
    data: {
      email: 'jan.kowalski@gmail.com',
      password: hashedPassword, // <-- POPRAWIONO
      firstName: 'Jan',
      lastName: 'Kowalski',
      role: Role.CLIENT,
      qrCode: 'JK2026-0512',
    }
  });

  console.log('Utworzono konta użytkowników.');

  // 5. Nawiązanie współpracy Trener <-> Klient
  const relation = await prisma.trainerUserRelation.create({
    data: {
      clientId: client.id,
      trainerId: trainer.id,
    }
  });

  // 6. Przypisanie planu treningowego dla klienta przez trenera
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

  // 7. Rejestracja testowego wejścia na siłownię przez kod QR
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
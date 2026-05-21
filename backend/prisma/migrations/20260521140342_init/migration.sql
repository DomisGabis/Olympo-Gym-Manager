-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'TRAINER', 'RECEPTIONIST', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "muscleParts" TEXT[],
    "level" TEXT NOT NULL,
    "videoUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOut" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "club_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_user_relations" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_user_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_entries" (
    "id" TEXT NOT NULL,
    "relationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plans" (
    "id" TEXT NOT NULL,
    "relationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_entries" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "setsCount" INTEGER NOT NULL,
    "repsRange" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "plan_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "relationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_qrCode_key" ON "users"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_user_relations_clientId_trainerId_key" ON "trainer_user_relations"("clientId", "trainerId");

-- AddForeignKey
ALTER TABLE "club_entries" ADD CONSTRAINT "club_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_user_relations" ADD CONSTRAINT "trainer_user_relations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_user_relations" ADD CONSTRAINT "trainer_user_relations_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "trainer_user_relations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "trainer_user_relations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_entries" ADD CONSTRAINT "plan_entries_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_entries" ADD CONSTRAINT "plan_entries_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "trainer_user_relations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

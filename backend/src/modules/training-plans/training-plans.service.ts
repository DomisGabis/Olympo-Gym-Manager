import { PrismaClient } from '@prisma/client';

export class TrainingPlansService {
  private prisma = new PrismaClient();

  /**
   * Tworzenie nowego planu treningowego wraz z jego pozycjami (ćwiczeniami)
   */
  async createPlan(trainerId: string, clientId: string, title: string, startDate: string, endDate: string, entries: any[]) {
    // 1. Sprawdź, czy istnieje relacja Trener <-> Klient
    let relation = await this.prisma.trainerUserRelation.findUnique({
      where: { clientId_trainerId: { clientId, trainerId } }
    });

    // Jeśli nie ma relacji, stwórzmy ją automatycznie przy przypisywaniu planu
    if (!relation) {
      relation = await this.prisma.trainerUserRelation.create({
        data: { clientId, trainerId }
      });
    }

    // 2. Utwórz plan wraz z powiązanymi wpisami (PlanEntry) w jednej transakcji
    return this.prisma.trainingPlan.create({
      data: {
        relationId: relation.id,
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        progress: 0,
        entries: {
          create: entries.map(entry => ({
            exerciseId: entry.exerciseId,
            dayOfWeek: entry.dayOfWeek,
            setsCount: entry.setsCount,
            repsRange: entry.repsRange,
            weight: entry.weight || null,
            isCompleted: false
          }))
        }
      },
      include: {
        entries: {
          include: { exercise: true }
        }
      }
    });
  }

  /**
   * Pobieranie planów treningowych przypisanych do klienta
   */
  async getClientPlans(clientId: string) {
    return this.prisma.trainingPlan.findMany({
      where: {
        relation: { clientId }
      },
      include: {
        entries: {
          include: { exercise: true }
        },
        relation: {
          include: {
            trainer: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Odznaczanie ćwiczenia jako wykonane/niewykonane + automatyczne przeliczanie progresu planu
   */
  async toggleEntryCompletion(entryId: string, isCompleted: boolean) {
    // 1. Aktualizuj stan pojedynczego wpisu
    const updatedEntry = await this.prisma.planEntry.update({
      where: { id: entryId },
      data: { isCompleted }
    });

    // 2. Pobierz wszystkie wpisy z tego planu, aby przeliczyć progres
    const allEntries = await this.prisma.planEntry.findMany({
      where: { trainingPlanId: updatedEntry.trainingPlanId }
    });

    const totalEntries = allEntries.length;
    const completedEntries = allEntries.filter(e => e.isCompleted).length;
    
    // Oblicz procent (np. 3 ukończone z 4 = 75%)
    const newProgress = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

    // 3. Zaktualizuj pole progress w tabeli głównej planu
    await this.prisma.trainingPlan.update({
      where: { id: updatedEntry.trainingPlanId },
      data: { progress: newProgress }
    });

    return {
      updatedEntry,
      newProgress
    };
  }
}
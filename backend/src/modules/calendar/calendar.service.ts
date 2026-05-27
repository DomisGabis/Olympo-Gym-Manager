import { PrismaClient } from '@prisma/client';

export class CalendarService {
  private prisma = new PrismaClient();

  /**
   * Tworzenie nowego wydarzenia w kalendarzu przez trenera dla klienta
   */
  async createEntry(trainerId: string, clientId: string, title: string, startAt: string, endAt: string) {
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate <= startDate) {
      throw new Error('Data zakończenia spotkania musi być późniejsza niż data rozpoczęcia.');
    }

    // 1. Znajdź lub stwórz relację między trenerem a klientem
    let relation = await this.prisma.trainerUserRelation.findUnique({
      where: { clientId_trainerId: { clientId, trainerId } }
    });

    if (!relation) {
      relation = await this.prisma.trainerUserRelation.create({
        data: { clientId, trainerId }
      });
    }

    // 2. Dodaj wpis do kalendarza
    return this.prisma.calendarEntry.create({
      data: {
        relationId: relation.id,
        title,
        startAt: startDate,
        endAt: endDate
      },
      include: {
        relation: {
          include: {
            client: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    });
  }

  /**
   * Pobieranie kalendarza dla TRENERA (widzi wszystkich swoich klientów)
   */
  async getTrainerSchedule(trainerId: string) {
    return this.prisma.calendarEntry.findMany({
      where: {
        relation: { trainerId }
      },
      include: {
        relation: {
          include: {
            client: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { startAt: 'asc' }
    });
  }

  /**
   * Pobieranie kalendarza dla KLIENTA (widzi swoich trenerów)
   */
  async getClientSchedule(clientId: string) {
    return this.prisma.calendarEntry.findMany({
      where: {
        relation: { clientId }
      },
      include: {
        relation: {
          include: {
            trainer: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { startAt: 'asc' }
    });
  }

  /**
   * Usunięcie wpisu z kalendarza (np. odwołanie treningu)
   */
  async deleteEntry(id: string) {
    return this.prisma.calendarEntry.delete({
      where: { id }
    });
  }
}
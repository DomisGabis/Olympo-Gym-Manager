import { PrismaClient } from '@prisma/client';

export class CalendarService {
  private prisma = new PrismaClient();

  /**
   * Tworzenie nowego wydarzenia w kalendarzu (Trener tworzy jako CONFIRMED, Klient jako PENDING)
   */
  async createEntry(creatorId: string, targetId: string, creatorRole: string, title: string, startAt: string, endAt: string) {
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate <= startDate) {
      throw new Error('Data zakończenia spotkania musi być późniejsza niż data rozpoczęcia.');
    }

    // Dynamicznie mapujemy kto jest kim na podstawie roli twórcy rezerwacji
    const clientId = creatorRole === 'CLIENT' ? creatorId : targetId;
    const trainerId = creatorRole === 'TRAINER' ? creatorId : targetId;

    // 1. Sprawdzamy lub tworzymy relację między nimi
    let relation = await this.prisma.trainerUserRelation.findUnique({
      where: { clientId_trainerId: { clientId, trainerId } }
    });

    if (!relation) {
      relation = await this.prisma.trainerUserRelation.create({
        data: { clientId, trainerId }
      });
    }

    // 2. Ustalamy status: Jeśli klika trener -> od razu potwierdzone. Jeśli klient -> oczekuje na akceptację.
    const status = creatorRole === 'TRAINER' ? 'CONFIRMED' : 'PENDING';

    return this.prisma.calendarEntry.create({
      data: {
        relationId: relation.id,
        title,
        startAt: startDate,
        endAt: endDate,
        status: status // Zakładamy obecność pola status w schema.prisma
      },
      include: {
        relation: {
          include: {
            client: { select: { firstName: true, lastName: true, email: true } },
            trainer: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    });
  }

  /**
   * Pobieranie kalendarza danego trenera przez klienta (żeby widzieć, kiedy trener jest zajęty)
   */
  async getTrainerScheduleForClient(trainerId: string) {
    return this.prisma.calendarEntry.findMany({
      where: {
        relation: { trainerId },
        status: { in: ['CONFIRMED', 'PENDING'] } // Pokazujemy zajęte i rezerwowane sloty
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        // Ukrywamy dane innych klientów ze względów prywatności RODO!
        title: true 
      },
      orderBy: { startAt: 'asc' }
    });
  }

  /**
   * Zmiana statusu rezerwacji (Akceptacja / Odrzucenie przez trenera)
   */
  async updateStatus(id: string, trainerId: string, newStatus: 'CONFIRMED' | 'REJECTED') {
    // Weryfikacja, czy ten wpis w kalendarzu należy do tego trenera
    const entry = await this.prisma.calendarEntry.findFirst({
      where: {
        id,
        relation: { trainerId }
      }
    });

    if (!entry) {
      throw new Error('Nie znaleziono rezerwacji lub nie masz uprawnień do jej modyfikacji.');
    }

    return this.prisma.calendarEntry.update({
      where: { id },
      data: { status: newStatus }
    });
  }

  /**
   * Pobieranie kalendarza dla TRENERA
   */
  async getTrainerSchedule(trainerId: string) {
    return this.prisma.calendarEntry.findMany({
      where: { relation: { trainerId } },
      include: {
        relation: {
          include: { client: { select: { firstName: true, lastName: true } } }
        }
      },
      orderBy: { startAt: 'asc' }
    });
  }

  /**
   * Pobieranie kalendarza dla KLIENTA
   */
  async getClientSchedule(clientId: string) {
    return this.prisma.calendarEntry.findMany({
      where: { relation: { clientId } },
      include: {
        relation: {
          include: { trainer: { select: { firstName: true, lastName: true } } }
        }
      },
      orderBy: { startAt: 'asc' }
    });
  }

  /**
   * Bezpieczne usunięcie/odwołanie wpisu (sprawdza czy użytkownik uczestniczy w tym treningu)
   */
  async deleteEntry(id: string, userId: string, userRole: string) {
    if (userRole === 'ADMIN') {
      return this.prisma.calendarEntry.delete({ where: { id } });
    }

    // Sprawdzamy czy usuwający to klient lub trener powiązany z tym wpisem
    const entry = await this.prisma.calendarEntry.findFirst({
      where: {
        id,
        relation: userRole === 'TRAINER' ? { trainerId: userId } : { clientId: userId }
      }
    });

    if (!entry) {
      throw new Error('Nie masz uprawnień do odwołania tego treningu.');
    }

    return this.prisma.calendarEntry.delete({ where: { id } });
  }
}
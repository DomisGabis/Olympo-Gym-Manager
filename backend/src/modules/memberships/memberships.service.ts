import { PrismaClient } from '@prisma/client';

export class MembershipsService {
  private prisma = new PrismaClient();

  // Statyczna lista dostępnych rodzajów karnetów
  private membershipTypes = [
    { type: 'OPEN_30', name: 'Karnet Open 30 dni', price: 150, durationDays: 30 },
    { type: 'OPEN_90', name: 'Karnet Open 90 dni', price: 400, durationDays: 90 },
    { type: 'STUDENT_30', name: 'Karnet Studencki 30 dni', price: 110, durationDays: 30 }
  ];

  /**
   * Pobiera listę wszystkich dostępnych rodzajów karnetów
   */
  async getTypes() {
    return this.membershipTypes;
  }

  /**
   * Zakup karnetu przez klienta z logiką przedłużania (kolejkowania) ważności
   */
  async buyMembership(userId: string, typeCode: string) {
    const selectedType = this.membershipTypes.find(t => t.type === typeCode);
    if (!selectedType) {
      throw new Error('Wybrany typ karnetu nie istnieje.');
    }

    const now = new Date();

    // 1. Szukamy ostatniego aktywnego karnetu tego użytkownika, który kończy się w przyszłości
    const latestActiveMembership = await this.prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: now }
      },
      orderBy: { endDate: 'desc' } // Sortujemy od najpóźniej kończącego się
    });

    let startDate = new Date();

    // 2. Logika kolejkowania: jeśli istnieje aktywny karnet, nowy startuje dzień po jego zakończeniu
    if (latestActiveMembership) {
      startDate = new Date(latestActiveMembership.endDate);
      startDate.setDate(startDate.getDate() + 1);
    }

    // Ustawiamy godzinę rozpoczęcia na początek dnia
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + selectedType.durationDays);
    // Ustawiamy godzinę zakończenia na koniec dnia
    endDate.setHours(23, 59, 59, 999);

    // 3. Zapis w bazie danych
    return this.prisma.membership.create({
      data: {
        userId,
        type: selectedType.type,
        startDate,
        endDate,
        status: 'ACTIVE'
      }
    });
  }

  /**
   * Pobiera aktualnie ważny karnet użytkownika
   */
  async getByUserId(userId: string) {
    const now = new Date();
    
    return this.prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });
  }
}
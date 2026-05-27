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

  /**
   * Rejestracja wejścia klienta (Check-in) z wymogiem posiadania aktywnego karnetu
   */
  async checkIn(qrCode: string) {
    // 1. Znajdź użytkownika po kodzie QR
    const user = await this.prisma.user.findUnique({
      where: { qrCode }
    });

    if (!user) {
      throw new Error('Nieprawidłowy lub nieaktywny kod QR. Brak klienta w systemie.');
    }

    // 2. NOWOŚĆ: Walidacja ważności karnetu na dzień dzisiejszy
    const now = new Date();
    const hasValidMembership = await this.prisma.membership.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    if (!hasValidMembership) {
      throw new Error(`Wejście zablokowane. Brak aktywnego lub ważnego karnetu dla użytkownika: ${user.firstName} ${user.lastName}.`);
    }

    // 3. Sprawdź, czy klient już nie przebywa w klubie
    const activeEntry = await this.prisma.clubEntry.findFirst({
      where: {
        userId: user.id,
        checkOut: null
      }
    });

    if (activeEntry) {
      throw new Error('Klient posiada już status zalogowanego w klubie (brak Check-out).');
    }

    // 4. Jeśli wszystko OK -> wpuść klienta
    const entry = await this.prisma.clubEntry.create({
      data: {
        userId: user.id,
        status: 'AUTHORIZED'
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    return {
      message: `Pomyślnie zarejestrowano wejście: ${user.firstName} ${user.lastName}`,
      entry
    };
  }

  /**
   * Rejestracja wyjścia klienta z siłowni (Check-out)
   */
  async checkOut(userId: string) {
    const activeEntry = await this.prisma.clubEntry.findFirst({
      where: {
        userId,
        checkOut: null
      }
    });

    if (!activeEntry) {
      throw new Error('Nie znaleziono aktywnego pobytu w klubie dla tego użytkownika.');
    }

    const updatedEntry = await this.prisma.clubEntry.update({
      where: { id: activeEntry.id },
      data: {
        checkOut: new Date()
      }
    });

    return {
      message: 'Zakończono wizytę w klubie.',
      updatedEntry
    };
  }
}
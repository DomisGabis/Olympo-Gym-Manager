import { PrismaClient } from '@prisma/client';

export class MembershipsService {
  private prisma = new PrismaClient();

  // Statyczna lista dostępnych rodzajów karnetów (baza wiedzy dla frontendu)
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
   * Zakup karnetu przez klienta i zapis do bazy danych
   */
  async buyMembership(userId: string, typeCode: string) {
    const selectedType = this.membershipTypes.find(t => t.type === typeCode);
    if (!selectedType) {
      throw new Error('Wybrany typ karnetu nie istnieje.');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + selectedType.durationDays);

    // Zapisujemy aktywny karnet użytkownika do bazy PostgreSQL
    // (Uwaga: Zakładamy model 'membership' w schema.prisma z polami: userId, type, startDate, endDate, status)
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
   * Pobiera aktualnie aktywny karnet przypisany do zalogowanego użytkownika
   */
  async getByUserId(userId: string) {
    return this.prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });
  }

  /**
   * Rejestracja wejścia klienta na siłownię (Check-in) przez Pracownika Recepcji
   */
  async checkIn(qrCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { qrCode }
    });

    if (!user) {
      throw new Error('Nieprawidłowy lub nieaktywny kod QR. Brak klienta w systemie.');
    }

    const activeEntry = await this.prisma.clubEntry.findFirst({
      where: {
        userId: user.id,
        checkOut: null
      }
    });

    if (activeEntry) {
      throw new Error('Klient posiada już status zalogowanego w klubie (brak Check-out).');
    }

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
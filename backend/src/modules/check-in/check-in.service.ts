import { PrismaClient } from '@prisma/client';

export class CheckInService {
  private prisma = new PrismaClient();

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

    // 2. Walidacja ważności karnetu na dzień dzisiejszy
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
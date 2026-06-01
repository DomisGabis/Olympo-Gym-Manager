import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export class ClubEntryService {
  private prisma = new PrismaClient();
  private jwtSecret = process.env.JWT_SECRET || 'super_secret_olympo_key_2026';

  /**
   * Pobieranie historii wejść zalogowanego użytkownika z opcjonalnym filtrem miesiąca
   */
  async getUserHistory(userId: string, monthStr?: string) {
    const whereClause: any = { userId };

    // Jeśli podano filtr miesiąca (np. "5" lub "05" lub "2026-05")
    if (monthStr) {
      let year = new Date().getFullYear();
      let month = parseInt(monthStr, 10);

      // Obsługa formatu YYYY-MM jeśli klient prześle pełną datę
      if (monthStr.includes('-')) {
        const parts = monthStr.split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      }

      // Stworzenie przedziału czasowego od 1 dnia miesiąca do 1 dnia kolejnego miesiąca
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      whereClause.checkIn = {
        gte: startDate,
        lt: endDate
      };
    }

    return this.prisma.clubEntry.findMany({
      where: whereClause,
      orderBy: { checkIn: 'desc' } // Najnowsze wizyty na górze
    });
  }

  /**
   * Rejestracja wejścia klienta (Check-in)
   */
  async checkIn(dynamicQrCode: string) {
    let decoded: any;

    try {
      // 1. Rozkodowanie i walidacja czasu trwania dynamicznego kodu (ochrona przed screenami)
      decoded = jwt.verify(dynamicQrCode, this.jwtSecret);
    } catch (error) {
      throw new Error('Kod QR jest nieprawidłowy lub jego ważność (1 minuta) wygasła. Wygeneruj nowy kod.');
    }

    const staticQr = decoded.staticQr;

    // 2. Znajdź użytkownika po statycznym kodzie QR odczytanym z tokena
    const user = await this.prisma.user.findUnique({ where: { qrCode: staticQr } });
    if (!user) {
      throw new Error('Brak klienta w systemie dla odkodowanego numeru.');
    }

    // 3. Walidacja ważności karnetu na dzień dzisiejszy
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
      throw new Error(`Wejście zablokowane. Brak ważnego karnetu dla: ${user.firstName} ${user.lastName}.`);
    }

    // 4. Sprawdź, czy klient już nie przebywa w klubie
    const activeEntry = await this.prisma.clubEntry.findFirst({
      where: { userId: user.id, checkOut: null }
    });

    if (activeEntry) {
      throw new Error('Klient posiada już status zalogowanego w klubie.');
    }

    // 5. Wpuszczenie klienta
    const entry = await this.prisma.clubEntry.create({
      data: { userId: user.id, status: 'AUTHORIZED' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } }
    });

    return {
      message: `Pomyślnie zarejestrowano wejście: ${user.firstName} ${user.lastName}`,
      entry
    };
  }

  /**
   * Rejestracja wyjścia klienta (Check-out)
   */
  async checkOut(userId: string) {
    const activeEntry = await this.prisma.clubEntry.findFirst({
      where: { userId, checkOut: null }
    });

    if (!activeEntry) {
      throw new Error('Nie znaleziono aktywnego pobytu w klubie dla tego użytkownika.');
    }

    const updatedEntry = await this.prisma.clubEntry.update({
      where: { id: activeEntry.id },
      data: { checkOut: new Date() }
    });

    return {
      message: 'Zakończono wizytę w klubie.',
      updatedEntry
    };
  }
}
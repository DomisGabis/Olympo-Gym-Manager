import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export class ClubEntryService {
  private prisma = new PrismaClient();
  private jwtSecret = process.env.JWT_SECRET || 'super_secret_olympo_key_2026';

  async getUserHistory(userId: string, monthStr?: string) {
    const whereClause: any = { userId };

    if (monthStr) {
      let year = new Date().getFullYear();
      let month = parseInt(monthStr, 10);

      if (monthStr.includes('-')) {
        const parts = monthStr.split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      whereClause.checkIn = {
        gte: startDate,
        lt: endDate
      };
    }

    return this.prisma.clubEntry.findMany({
      where: whereClause,
      orderBy: { checkIn: 'desc' }
    });
  }

  async processEntry(dynamicQrCode: string) {
    let decoded: any;

    try {
      decoded = jwt.verify(dynamicQrCode, this.jwtSecret);
    } catch (error) {
      throw new Error('Kod QR jest nieprawidłowy lub jego ważność (1 minuta) wygasła. Wygeneruj nowy kod.');
    }

    const staticQr = decoded.staticQr;

    const user = await this.prisma.user.findUnique({ where: { qrCode: staticQr } });
    if (!user) {
      throw new Error('Brak klienta w systemie dla odkodowanego numeru.');
    }

    const activeEntry = await this.prisma.clubEntry.findFirst({
      where: { userId: user.id, checkOut: null }
    });

    if (activeEntry) {
      const updatedEntry = await this.prisma.clubEntry.update({
        where: { id: activeEntry.id },
        data: { checkOut: new Date() },
        include: { user: { select: { firstName: true, lastName: true } } }
      });

      return {
        action: 'CHECK_OUT',
        message: `Pomyślnie zarejestrowano WYJŚCIE. Do zobaczenia, ${user.firstName} ${user.lastName}!`,
        data: updatedEntry
      };
    } else {
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

      const entry = await this.prisma.clubEntry.create({
        data: { userId: user.id, status: 'AUTHORIZED' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } }
      });

      return {
        action: 'CHECK_IN',
        message: `Pomyślnie zarejestrowano WEJŚCIE. Użytkownik: ${user.firstName} ${user.lastName}`,
        data: entry
      };
    }
  }
}
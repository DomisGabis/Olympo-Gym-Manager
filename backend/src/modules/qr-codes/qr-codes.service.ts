import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export class QrCodesService {
  private prisma = new PrismaClient();
  private jwtSecret = process.env.JWT_SECRET || 'super_secret_olympo_key_2026';

  /**
   * Generuje krótko żyjący (dynamiczny) kod QR dla użytkownika.
   */
  async generateDynamicQr(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.qrCode) {
      throw new Error('Użytkownik nie posiada przypisanego statycznego kodu QR.');
    }

    // Pakujemy statyczny kod QR do tokena ważnego tylko 60 sekund ('1m')
    // Zapewnia to mix "unikalnego identyfikatora" z "obecnym czasem" w bezpieczny sposób.
    const dynamicQrToken = jwt.sign(
      { staticQr: user.qrCode, userId: user.id },
      this.jwtSecret,
      { expiresIn: '1m' } 
    );

    return dynamicQrToken;
  }
}
import { PrismaClient, Role } from '@prisma/client';

export class UsersService {
  private prisma = new PrismaClient();

  // Wspólny obiekt konfiguracji wykluczający hasło – unikamy powtórzeń w kodzie
  private userSelectWithoutPassword = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    qrCode: true,
    createdAt: true,
    updatedAt: true,
  };

  async getAll() {
    // Pobiera z bazy wszystkich użytkowników, automatycznie odrzucając hasła
    return this.prisma.user.findMany({
      select: this.userSelectWithoutPassword,
      orderBy: { lastName: 'asc' } // Opcjonalnie: sortowanie alfabetyczne po nazwisku
    });
  }

  async getById(id: string) {
    // Szuka użytkownika po unikalnym ID
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelectWithoutPassword
    });

    if (!user) {
      throw new Error('Nie znaleziono użytkownika.');
    }

    return user;
  }

  async getTrainers() {
    // Filtruje użytkowników po stronie bazy danych przy użyciu Enuma Role z Prismy
    return this.prisma.user.findMany({
      where: {
        role: Role.TRAINER
      },
      select: this.userSelectWithoutPassword,
      orderBy: { lastName: 'asc' }
    });
  }
}
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

export class UsersService {
  private prisma = new PrismaClient();

  // Wspólny obiekt konfiguracji wykluczający hasło
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

  // Pobiera użytkowników z paginacją oraz opcjonalnymi filtrami: roli i wyszukiwaniem tekstowym
  async getAll(page: number, limit: number, role?: Role, search?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (role) whereClause.role = role;

    if (search) {
      const normalizedSearch = search.trim();
      if (normalizedSearch.length) {
        whereClause.OR = [
          { firstName: { contains: normalizedSearch, mode: 'insensitive' } },
          { lastName: { contains: normalizedSearch, mode: 'insensitive' } },
          { email: { contains: normalizedSearch, mode: 'insensitive' } }
        ];
      }
    }

    // Pobieramy dane oraz łączną liczbę użytkowników spełniających kryteria
    const [data, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        select: this.userSelectWithoutPassword,
        skip: skip,
        take: limit,
        orderBy: { lastName: 'asc' }
      }),
      this.prisma.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelectWithoutPassword
    });

    if (!user) {
      throw new Error('Nie znaleziono użytkownika.');
    }

    return user;
  }

  async updateProfile(id: string, data: any) {
    const { email, password, firstName, lastName } = data;

    const updateData: any = {};
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (!Object.keys(updateData).length) {
      throw new Error('Brak danych do aktualizacji.');
    }

    // Sprawdź czy nowy email jest już zajęty przez innego użytkownika
    if (email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== id) {
        throw new Error('Adres e-mail jest już w użyciu.');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: this.userSelectWithoutPassword
    });

    return updatedUser;
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('Nie znaleziono użytkownika o podanym ID.');
    }

    await this.prisma.user.delete({ where: { id } });
    return;
  }

  // Wykorzystujemy elastyczność metody getAll do pobrania samych trenerów
  async getTrainers(page: number, limit: number, search?: string) {
    return this.getAll(page, limit, Role.TRAINER, search);
  }

  /**
   * Zwraca liczby użytkowników: ogółem oraz rozbite po rolach
   */
  async getCounts() {
    const [overall, clients, trainers, receptionists, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CLIENT } }),
      this.prisma.user.count({ where: { role: Role.TRAINER } }),
      this.prisma.user.count({ where: { role: Role.RECEPTIONIST } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);

    return {
      overall,
      byRole: {
        CLIENT: clients,
        TRAINER: trainers,
        RECEPTIONIST: receptionists,
        ADMIN: admins,
      }
    };
  }
}
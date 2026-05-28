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

  // Pobiera użytkowników z paginacją i opcjonalnym filtrem roli (np. CLIENT, TRAINER)
  async getAll(page: number, limit: number, role?: Role) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (role) whereClause.role = role;

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

  // Wykorzystujemy elastyczność metody getAll do pobrania samych trenerów
  async getTrainers(page: number, limit: number) {
    return this.getAll(page, limit, Role.TRAINER);
  }
}
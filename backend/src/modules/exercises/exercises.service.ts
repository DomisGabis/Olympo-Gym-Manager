import { PrismaClient } from '@prisma/client';

export class ExercisesService {
  private prisma = new PrismaClient();

  // Pobieranie wszystkich z filtrowaniem i PAGINACJĄ (C - Read)
  async getAll(page: number, limit: number, category?: string, level?: string) {
    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (level) whereClause.level = level;

    // Przeliczamy ile rekordów pominąć
    const skip = (page - 1) * limit;

    // Pobieramy dane oraz łączną liczbę wpisów spełniających kryteria
    const [data, totalItems] = await Promise.all([
      this.prisma.exercise.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      this.prisma.exercise.count({ where: whereClause })
    ]);

    // Obliczamy całkowitą liczbę stron
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

  // Pobieranie pojedynczego po ID
  async getById(id: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) throw new Error('Nie znaleziono ćwiczenia o podanym ID.');
    return exercise;
  }

  // Dodawanie nowego ćwiczenia (C - Create)
  async create(data: { name: string; category: string; muscleParts: string[]; level: string; videoUrl?: string; description?: string }) {
    const existing = await this.prisma.exercise.findUnique({ where: { name: data.name } });
    if (existing) throw new Error('Ćwiczenie o tej nazwie już istnieje w bazie.');

    return this.prisma.exercise.create({ data });
  }

  // Aktualizacja ćwiczenia (U - Update)
  async update(id: string, data: any) {
    return this.prisma.exercise.update({
      where: { id },
      data
    });
  }

  // Usuwanie ćwiczenia (D - Delete)
  async delete(id: string) {
    try {
      return await this.prisma.exercise.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new Error('Nie można usunąć tego ćwiczenia, ponieważ jest już przypisane do aktywnych planów treningowych klientów.');
      }
      throw error;
    }
  }
}
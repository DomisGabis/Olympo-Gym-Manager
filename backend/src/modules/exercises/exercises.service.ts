import { PrismaClient } from '@prisma/client';

export class ExercisesService {
  private prisma = new PrismaClient();

  // Pobieranie wszystkich z opcjonalnym filtrowaniem (C - Read)
  async getAll(category?: string, level?: string) {
    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (level) whereClause.level = level;

    return this.prisma.exercise.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
  }

  // Pobieranie pojedynczego po ID
  async getById(id: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) throw new Error('Nie znaleziono ćwiczenia o podanym ID.');
    return exercise;
  }

  // Dodawanie nowego ćwiczenia (C - Create)
  async create(data: { name: string; category: string; muscleParts: string[]; level: string; videoUrl?: string; description?: string }) {
    // Sprawdzamy czy nazwa już istnieje (żeby nie było duplikatów)
    const existing = await this.prisma.exercise.findUnique({ where: { name: data.name } });
    if (existing) throw new Error('Ćwiczenie o tej nazwie już istnieje w bazie.');

    return this.prisma.exercise.create({ data });
  }

  // Aktualizacja ćwiczenia (U - Update)
  async update(id: string, data: any) {
    // Prisma sama poradzi sobie z aktualizacją tylko tych pól, które zostały przesłane
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
      // P2003 to błąd bazy PostgreSQL, gdy zadziała klucz obcy (u nas: onDelete: Restrict)
      if (error.code === 'P2003') {
        throw new Error('Nie można usunąć tego ćwiczenia, ponieważ jest już przypisane do aktywnych planów treningowych klientów.');
      }
      throw error;
    }
  }
}
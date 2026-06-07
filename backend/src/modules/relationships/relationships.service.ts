import { PrismaClient } from '@prisma/client';

export class RelationshipsService {
  private prisma = new PrismaClient();

  // Zwraca trenerów dla klienta lub klientów dla trenera
  async getForUser(userId: string, role: string) {
    if (role === 'CLIENT') {
      const relations = await this.prisma.trainerUserRelation.findMany({
        where: { clientId: userId },
        include: { trainer: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } }
      });

      return { trainers: relations.map(r => r.trainer) };
    }

    if (role === 'TRAINER') {
      const relations = await this.prisma.trainerUserRelation.findMany({
        where: { trainerId: userId },
        include: { client: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } }
      });

      return { clients: relations.map(r => r.client) };
    }

    // Dla innych ról zwracamy pustą strukturę
    return { trainers: [], clients: [] };
  }
}

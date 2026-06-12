import { PrismaClient } from '@prisma/client';

export class MembershipsService {
  private prisma = new PrismaClient();

  private membershipTypes = [
    { type: 'OPEN_30', name: 'Karnet Open 30 dni', price: 150, durationDays: 30 },
    { type: 'OPEN_90', name: 'Karnet Open 90 dni', price: 400, durationDays: 90 },
    { type: 'STUDENT_30', name: 'Karnet Studencki 30 dni', price: 110, durationDays: 30 }
  ];

  async getTypes() {
    return this.membershipTypes;
  }

  async createMembership(clientId: string, typeCode: string, startingDate: string) {
    const selectedType = this.membershipTypes.find(t => t.type === typeCode);
    if (!selectedType) {
      throw new Error('Wybrany typ karnetu nie istnieje.');
    }

    let startDate = new Date(startingDate);
    if (isNaN(startDate.getTime())) {
      throw new Error('Podano nieprawidłowy format daty początkowej.');
    }
    startDate.setHours(0, 0, 0, 0);

    const conflictingMembership = await this.prisma.membership.findFirst({
      where: {
        userId: clientId,
        status: 'ACTIVE',
        endDate: { gte: startDate }
      },
      orderBy: { endDate: 'desc' }
    });

    if (conflictingMembership) {
      startDate = new Date(conflictingMembership.endDate);
      startDate.setDate(startDate.getDate() + 1);
    }

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + selectedType.durationDays);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.membership.create({
      data: {
        userId: clientId,
        type: selectedType.type,
        startDate,
        endDate,
        status: 'ACTIVE'
      }
    });
  }

  async getByUserId(userId: string) {
    const now = new Date();
    
    return this.prisma.membership.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: now }
      }
    });
  }
}
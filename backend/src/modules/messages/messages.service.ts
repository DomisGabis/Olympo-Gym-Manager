import { PrismaClient } from '@prisma/client';

export class MessagesService {
  private prisma = new PrismaClient();

  /**
   * Wysyłanie wiadomości z automatycznym zarządzaniem relacją
   */
  async sendMessage(senderId: string, receiverId: string, content: string, senderRole: string) {
    // Dynamicznie ustalamy, który ID należy do trenera, a który do klienta
    const clientId = senderRole === 'CLIENT' ? senderId : receiverId;
    const trainerId = senderRole === 'TRAINER' ? senderId : receiverId;

    // 1. Sprawdzamy relację
    let relation = await this.prisma.trainerUserRelation.findUnique({
      where: { clientId_trainerId: { clientId, trainerId } }
    });

    // 2. Jeśli klient pisze do trenera po raz pierwszy (lub odwrotnie), tworzymy relację
    if (!relation) {
      relation = await this.prisma.trainerUserRelation.create({
        data: { clientId, trainerId }
      });
    }

    // 3. Zapisujemy nową wiadomość
    return this.prisma.message.create({
      data: {
        relationId: relation.id,
        senderId,
        content
      }
    });
  }

  /**
   * Pobieranie historii konwersacji (chronologicznie)
   */
  async getConversation(userId: string, contactId: string, userRole: string) {
    const clientId = userRole === 'CLIENT' ? userId : contactId;
    const trainerId = userRole === 'TRAINER' ? userId : contactId;

    const relation = await this.prisma.trainerUserRelation.findUnique({
      where: { clientId_trainerId: { clientId, trainerId } }
    });

    // Jeśli nie ma relacji, nie ma też historii wiadomości
    if (!relation) {
      return [];
    }

    // Pobieramy posortowane wiadomości z bazy
    return this.prisma.message.findMany({
      where: { relationId: relation.id },
      orderBy: { createdAt: 'asc' } // Najstarsze na początku (jak w standardowych czatach)
    });
  }
}
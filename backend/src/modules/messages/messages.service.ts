import { PrismaClient } from '@prisma/client';

export class MessagesService {
  private prisma = new PrismaClient();

  /**
   * Wysyłanie wiadomości z automatycznym zarządzaniem relacją
   */
  async sendMessage(senderId: string, receiverId: string, content: string, senderRole: string) {
    const clientId = senderRole === 'CLIENT' ? senderId : receiverId;
    const trainerId = senderRole === 'TRAINER' ? senderId : receiverId;

    let relation = await this.prisma.trainerUserRelation.findUnique({
      where: { clientId_trainerId: { clientId, trainerId } }
    });

    if (!relation) {
      relation = await this.prisma.trainerUserRelation.create({
        data: { clientId, trainerId }
      });
    }

    return this.prisma.message.create({
      data: {
        relationId: relation.id,
        senderId,
        content
      }
    });
  }

  /**
   * Pobieranie historii konwersacji (Messenger-like: od najnowszych, ale posortowane poprawnie)
   */
  async getConversation(userId: string, contactId: string, userRole: string, page: number, limit: number) {
    const clientId = userRole === 'CLIENT' ? userId : contactId;
    const trainerId = userRole === 'TRAINER' ? userId : contactId;

    const relation = await this.prisma.trainerUserRelation.findUnique({
      where: { clientId_trainerId: { clientId, trainerId } }
    });

    if (!relation) {
      return { data: [], meta: { totalItems: 0, totalPages: 0, currentPage: page, limit } };
    }

    const skip = (page - 1) * limit;

    // Pobieramy wiadomości od NAJNOWSZYCH (desc), żeby uciąć historię z przeszłości
    const [rawMessages, totalItems] = await Promise.all([
      this.prisma.message.findMany({
        where: { relationId: relation.id },
        orderBy: { createdAt: 'desc' }, 
        skip: skip,
        take: limit
      }),
      this.prisma.message.count({ where: { relationId: relation.id } })
    ]);

    // Odwracamy pobraną paczkę (np. 20 wiadomości), aby na ekranie wyświetlały się 
    // naturalnie: starsza na górze, nowsza na dole.
    const messages = rawMessages.reverse();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: messages,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    };
  }
}
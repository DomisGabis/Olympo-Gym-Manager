import { Request, Response } from 'express';
import { MessagesService } from './messages.service';

const messagesService = new MessagesService();

export class MessagesController {
  
  async send(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const { receiverId, content } = req.body;

      if (!receiverId || !content) {
        return res.status(400).json({ success: false, message: 'Wymagane jest przesłanie receiverId oraz content.' });
      }

      const message = await messagesService.sendMessage(
        userPayload.id, 
        receiverId, 
        content, 
        userPayload.role
      );
      
      return res.status(201).json({ success: true, message: 'Wiadomość została wysłana.', data: message });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const userId = req.params.userId as string;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'Wymagane jest ID użytkownika w adresie URL.' });
      }

      // Pobieramy parametry paginacji (Domyślnie: strona 1, ostatnich 20 wiadomości)
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await messagesService.getConversation(
        userPayload.id, 
        userId, 
        userPayload.role,
        page,
        limit
      );
      
      return res.status(200).json({ 
        success: true, 
        data: result.data, 
        meta: result.meta 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
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
      const contactId = req.params.contactId as string;

      if (!contactId) {
        return res.status(400).json({ success: false, message: 'Wymagane jest ID kontaktu w adresie URL.' });
      }

      const messages = await messagesService.getConversation(
        userPayload.id, 
        contactId, 
        userPayload.role
      );
      
      return res.status(200).json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
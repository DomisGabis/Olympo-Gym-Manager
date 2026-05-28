import { Request, Response } from 'express';
import { MembershipsService } from './memberships.service';

const membershipsService = new MembershipsService();

export class MembershipsController {
  // === SEKCJA OBSŁUGI KARNETÓW (KLIENT) ===

  async getTypes(req: Request, res: Response) {
    try {
      const types = await membershipsService.getTypes();
      return res.status(200).json({ success: true, data: types });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async buy(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const { type } = req.body; 

      if (!type) {
        return res.status(400).json({ success: false, message: 'Wymagane jest podanie typu karnetu (type).' });
      }

      const membership = await membershipsService.buyMembership(userPayload.id, type);
      
      const now = new Date();
      const isQueued = new Date(membership.startDate) > now;
      
      const message = isQueued
        ? 'Karnet został pomyślnie zakupiony i dodany do kolejki (aktywuje się automatycznie po wygaśnięciu obecnego).'
        : 'Karnet został pomyślnie zakupiony i aktywowany!';

      return res.status(201).json({
        success: true,
        message,
        data: membership
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyMembership(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const membership = await membershipsService.getByUserId(userPayload.id);
      
      return res.status(200).json({ 
        success: true, 
        data: membership,
        message: membership ? 'Pobrano aktywny karnet.' : 'Brak aktywnego karnetu w tym momencie.'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
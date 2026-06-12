import { Request, Response } from 'express';
import { MembershipsService } from './memberships.service';

const membershipsService = new MembershipsService();

export class MembershipsController {
  async getTypes(req: Request, res: Response) {
    try {
      const types = await membershipsService.getTypes();
      return res.status(200).json({ success: true, data: types });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { clientId, membershipType, startingDate } = req.body; 

      if (!clientId || !membershipType || !startingDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Wymagane parametry: clientId, membershipType oraz startingDate.' 
        });
      }

      const membership = await membershipsService.createMembership(clientId, membershipType, startingDate);
      
      const requestedDate = new Date(startingDate);
      requestedDate.setHours(0, 0, 0, 0);
      
      const actualStartDate = new Date(membership.startDate);
      actualStartDate.setHours(0, 0, 0, 0);

      const isShifted = actualStartDate.getTime() > requestedDate.getTime();
      
      const message = isShifted
        ? `Klient posiada już aktywny karnet w tym okresie. Nowy karnet został automatycznie przesunięty i aktywuje się dnia: ${actualStartDate.toLocaleDateString('pl-PL')}.`
        : 'Karnet został pomyślnie dodany i aktywowany od wybranej daty!';

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

  async getMembershipsByUserId(req: Request, res: Response) {
    try {
      const userId = req.params.id as string;
      const memberships = await membershipsService.getByUserId(userId);

      return res.status(200).json({ 
        success: true, 
        data: memberships,
        message: memberships ? 'Pobrano aktywne karnety użytkownika.' : 'Użytkownik nie posiada aktywnych karnetów.'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
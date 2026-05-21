import { Request, Response } from 'express';
import { MembershipsService } from './memberships.service';

const membershipsService = new MembershipsService();

export class MembershipsController {
  // === SEKCA OBSŁUGI KARNETÓW (KLIENT) ===

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

      const membership = await membershipsService.buyMembership(userPayload.id, type);
      return res.status(201).json({
        success: true,
        message: 'Karnet został pomyślnie zakupiony i aktywowany!',
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
      return res.status(200).json({ success: true, data: membership });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // === SEKCJA REJESTRACJI WEJŚĆ/WYJŚĆ (RECEPCJA / ADMIN) ===

  async checkIn(req: Request, res: Response) {
    try {
      const { qrCode } = req.body;
      if (!qrCode) throw new Error('Wymagane jest przesłanie kodu qrCode.');

      const result = await membershipsService.checkIn(qrCode);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async checkOut(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) throw new Error('Wymagane jest przesłanie identyfikatora userId.');

      const result = await membershipsService.checkOut(userId);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
import { Request, Response } from 'express';
import { ClubEntryService } from './club-entry.service';

const clubEntryService = new ClubEntryService();

export class ClubEntryController {

  // GET /api/club-entries/my?month=5
  async getMyHistory(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const month = req.query.month as string | undefined; // np. "5" lub "2026-05"

      const history = await clubEntryService.getUserHistory(userPayload.id, month);
      return res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // POST /api/club-entries
  async checkIn(req: Request, res: Response) {
    try {
      const { qrCode } = req.body;
      if (!qrCode) {
        return res.status(400).json({ success: false, message: 'Wymagane jest przesłanie kodu qrCode.' });
      }

      const result = await clubEntryService.checkIn(qrCode);
      return res.status(201).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/club-entries
  async checkOut(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Wymagane jest przesłanie identyfikatora userId.' });
      }

      const result = await clubEntryService.checkOut(userId);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
import { Request, Response } from 'express';
import { ClubEntryService } from './club-entry.service';

const clubEntryService = new ClubEntryService();

export class ClubEntryController {

  async getMyHistory(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const month = req.query.month as string | undefined;

      const history = await clubEntryService.getUserHistory(userPayload.id, month);
      return res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async processEntry(req: Request, res: Response) {
    try {
      const { qrCode } = req.body;
      if (!qrCode) {
        return res.status(400).json({ success: false, message: 'Wymagane jest przesłanie kodu qrCode.' });
      }

      const result = await clubEntryService.processEntry(qrCode);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
import { Request, Response } from 'express';
import { CheckInService } from './check-in.service';

const checkInService = new CheckInService();

export class CheckInController {
  async checkIn(req: Request, res: Response) {
    try {
      const { qrCode } = req.body;
      if (!qrCode) {
        return res.status(400).json({ success: false, message: 'Wymagane jest przesłanie kodu qrCode.' });
      }

      const result = await checkInService.checkIn(qrCode);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async checkOut(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Wymagane jest przesłanie identyfikatora userId.' });
      }

      const result = await checkInService.checkOut(userId);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
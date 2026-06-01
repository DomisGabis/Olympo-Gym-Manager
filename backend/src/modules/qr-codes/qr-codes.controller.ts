import { Request, Response } from 'express';
import { QrCodesService } from './qr-codes.service';

const qrCodesService = new QrCodesService();

export class QrCodesController {
  async generate(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      
      const dynamicQrToken = await qrCodesService.generateDynamicQr(userPayload.id);

      return res.status(200).json({
        success: true,
        message: 'Wygenerowano tymczasowy kod QR ważny przez 1 minutę.',
        data: {
          qrString: dynamicQrToken // Frontend użyje tego stringa do wygenerowania obrazka QR
        }
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
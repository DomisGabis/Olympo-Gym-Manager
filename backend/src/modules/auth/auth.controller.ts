import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'Konto zostało utworzone pomyślnie!',
        data: user
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json({
        success: true,
        message: 'Zalogowano pomyślnie!',
        data: result
      });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  // NOWA METODA: Obsługa żądania usunięcia konta
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await authService.delete(id);
      return res.status(200).json({
        success: true,
        message: 'Użytkownik oraz wszystkie jego powiązane dane zostały pomyślnie usunięte z systemu.'
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
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

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Brak tokenu autoryzacji Google.' });
      }

      const result = await authService.googleLogin(token);
      return res.status(200).json({
        success: true,
        message: 'Zalogowano przez Google pomyślnie!',
        data: result
      });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }
}
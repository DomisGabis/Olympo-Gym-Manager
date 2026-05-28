import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

const usersService = new UsersService();

export class UsersController {
  async getProfile(req: Request, res: Response) {
    try {
      const userPayload = req.user as any; // Dane wstrzyknięte przez Passport JWT
      const user = await usersService.getById(userPayload.id);
      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async getTrainers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await usersService.getTrainers(page, limit);
      
      return res.status(200).json({ 
        success: true, 
        data: result.data, 
        meta: result.meta 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Pobieramy opcjonalną rolę z Query string (np. ?role=CLIENT lub ?role=TRAINER)
      const role = req.query.role as Role; 

      const result = await usersService.getAll(page, limit, role);
      
      return res.status(200).json({ 
        success: true, 
        data: result.data, 
        meta: result.meta 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
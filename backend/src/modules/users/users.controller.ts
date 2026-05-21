import { Request, Response } from 'express';
import { UsersService } from './users.service';

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
    const trainers = await usersService.getTrainers();
    return res.status(200).json({ success: true, data: trainers });
  }

  async getAllUsers(req: Request, res: Response) {
    const users = await usersService.getAll();
    return res.status(200).json({ success: true, data: users });
  }
}
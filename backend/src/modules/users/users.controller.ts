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

  async updateProfile(req: Request, res: Response) {
    try {
      const userPayload = req.user as any;
      const updatedUser = await usersService.updateProfile(userPayload.id, req.body);
      return res.status(200).json({ success: true, message: 'Profil został zaktualizowany.', data: updatedUser });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id as string;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Parametr id użytkownika jest wymagany.' });
      }
      const updatedUser = await usersService.updateProfile(userId, req.body);
      return res.status(200).json({ success: true, message: 'Profil użytkownika został zaktualizowany.', data: updatedUser });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTrainers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string)?.trim();

      const result = await usersService.getTrainers(page, limit, search);
      
      return res.status(200).json({ 
        success: true, 
        data: result.data, 
        meta: result.meta 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getClients(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string)?.trim();

      const result = await usersService.getAll(page, limit, Role.CLIENT, search);
      return res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getReceptionists(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string)?.trim();

      const result = await usersService.getAll(page, limit, Role.RECEPTIONIST, search);
      return res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAdmins(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string)?.trim();

      const result = await usersService.getAll(page, limit, Role.ADMIN, search);
      return res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUsersByRole(req: Request, res: Response) {
    try {
      const roleParam = (req.params.role as string).toUpperCase();
      const allowedRoles = [Role.CLIENT, Role.TRAINER, Role.RECEPTIONIST, Role.ADMIN];

      if (!allowedRoles.includes(roleParam as Role)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowa rola w adresie URL.' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string)?.trim();

      const result = await usersService.getAll(page, limit, roleParam as Role, search);
      return res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Pobieramy opcjonalne filtry z Query string:
      // np. ?role=CLIENT lub ?search=an
      const role = req.query.role as Role;
      const search = (req.query.search as string)?.trim();

      const result = await usersService.getAll(page, limit, role, search);
      
      return res.status(200).json({ 
        success: true, 
        data: result.data, 
        meta: result.meta 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCounts(req: Request, res: Response) {
    try {
      const counts = await usersService.getCounts();
      return res.status(200).json({ success: true, data: counts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await usersService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Użytkownik został pomyślnie usunięty.'
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
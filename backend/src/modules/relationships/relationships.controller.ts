import { Request, Response } from 'express';
import { RelationshipsService } from './relationships.service';

const relationshipsService = new RelationshipsService();

export class RelationshipsController {
  async getRelationships(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const result = await relationshipsService.getForUser(user.id, user.role);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

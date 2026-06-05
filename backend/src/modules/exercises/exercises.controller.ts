import { Request, Response } from 'express';
import { ExercisesService } from './exercises.service';

const exercisesService = new ExercisesService();

export class ExercisesController {
  async getAll(req: Request, res: Response) {
    try {
      const { category, level } = req.query;
      const search = (req.query.search as string)?.trim();
      
      // Wyciągamy parametry paginacji z URL i zamieniamy na liczby
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await exercisesService.getAll(page, limit, category as string, level as string, search);
      
      // Zwracamy strukturę z podziałem na dane i metadane paginacji
      return res.status(200).json({ 
        success: true, 
        data: result.data, 
        meta: result.meta 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const exercise = await exercisesService.getById(id);
      return res.status(200).json({ success: true, data: exercise });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const exercise = await exercisesService.create(req.body);
      return res.status(201).json({ success: true, message: 'Pomyślnie dodano nowe ćwiczenie.', data: exercise });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const exercise = await exercisesService.update(id, req.body);
      return res.status(200).json({ success: true, message: 'Zaktualizowano dane ćwiczenia.', data: exercise });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await exercisesService.delete(id);
      return res.status(200).json({ success: true, message: 'Ćwiczenie zostało całkowicie usunięte z bazy.' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
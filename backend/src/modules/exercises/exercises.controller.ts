import { Request, Response } from 'express';
import { ExercisesService } from './exercises.service';

const exercisesService = new ExercisesService();

export class ExercisesController {
  async getAll(req: Request, res: Response) {
    try {
      const { category, level } = req.query;
      const exercises = await exercisesService.getAll(category as string, level as string);
      return res.status(200).json({ success: true, data: exercises });
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
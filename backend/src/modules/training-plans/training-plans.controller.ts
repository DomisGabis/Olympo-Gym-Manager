import { Request, Response } from 'express';
import { TrainingPlansService } from './training-plans.service';

const plansService = new TrainingPlansService();

export class TrainingPlansController {
  
  // Trener przypisuje plan klientowi
  async create(req: Request, res: Response) {
    try {
      const trainerPayload = req.user as any; // Pobierane z tokenu JWT trenera
      const { clientId, title, startDate, endDate, entries } = req.body;

      if (!clientId || !title || !startDate || !endDate || !entries || !entries.length) {
        return res.status(400).json({ success: false, message: 'Brakujące lub niekompletne dane planu.' });
      }

      const plan = await plansService.createPlan(
        trainerPayload.id,
        clientId,
        title,
        startDate,
        endDate,
        entries
      );

      return res.status(201).json({ success: true, message: 'Plan treningowy został pomyślnie utworzony!', data: plan });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Klient pobiera swoje plany treningowe
  async getMyPlans(req: Request, res: Response) {
    try {
      const clientPayload = req.user as any; // Pobierane z tokenu JWT klienta
      const plans = await plansService.getClientPlans(clientPayload.id);

      return res.status(200).json({ success: true, data: plans });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Pobranie planów treningowych dla wskazanego klienta (dla trenera/administratora)
  async getClientPlansById(req: Request, res: Response) {
    try {
      const clientId = req.params.id as string;
      if (!clientId) {
        return res.status(400).json({ success: false, message: 'Parametr id klienta jest wymagany w ścieżce URL.' });
      }

      const plans = await plansService.getClientPlans(clientId);
      return res.status(200).json({ success: true, data: plans });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updatePlan(req: Request, res: Response) {
    try {
      const planId = req.params.id as string;
      const payload = req.body;
      const userPayload = req.user as any;
      const plan = await plansService.getPlanWithRelation(planId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan treningowy nie istnieje.' });
      }

      const isClientOwner = userPayload.role === 'CLIENT' && plan.relation.clientId === userPayload.id;
      const isTrainerOwner = userPayload.role === 'TRAINER' && plan.relation.trainerId === userPayload.id;

      if (!isClientOwner && !isTrainerOwner) {
        return res.status(403).json({ success: false, message: 'Brak uprawnień do modyfikacji tego planu.' });
      }

      const updatedPlan = await plansService.updatePlan(planId, payload);
      return res.status(200).json({ success: true, message: 'Plan treningowy został zaktualizowany.', data: updatedPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deletePlan(req: Request, res: Response) {
    try {
      const planId = req.params.id as string;
      const userPayload = req.user as any;
      const plan = await plansService.getPlanWithRelation(planId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan treningowy nie istnieje.' });
      }

      const isClientOwner = userPayload.role === 'CLIENT' && plan.relation.clientId === userPayload.id;
      const isTrainerOwner = userPayload.role === 'TRAINER' && plan.relation.trainerId === userPayload.id;

      if (!isClientOwner && !isTrainerOwner) {
        return res.status(403).json({ success: false, message: 'Brak uprawnień do usunięcia tego planu.' });
      }

      await plansService.deletePlan(planId);
      return res.status(200).json({ success: true, message: 'Plan treningowy został usunięty.' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async resetPlanProgress(req: Request, res: Response) {
    try {
      const planId = req.params.id as string;
      const userPayload = req.user as any;
      const plan = await plansService.getPlanWithRelation(planId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan treningowy nie istnieje.' });
      }

      const isClientOwner = userPayload.role === 'CLIENT' && plan.relation.clientId === userPayload.id;
      const isTrainerOwner = userPayload.role === 'TRAINER' && plan.relation.trainerId === userPayload.id;

      if (!isClientOwner && !isTrainerOwner) {
        return res.status(403).json({ success: false, message: 'Brak uprawnień do zresetowania tego planu.' });
      }

      const updatedPlan = await plansService.resetPlanProgress(planId);
      return res.status(200).json({ success: true, message: 'Postęp planu został zresetowany.', data: updatedPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Klient odznacza ćwiczenie (np. na treningu klika checkbox w aplikacji)
  async toggleEntry(req: Request, res: Response) {
    try {
      // Rzutujemy parametry na string, aby TypeScript nie obawiał się, że to tablica string[]
      const entryId = req.params.entryId as string;
      const { isCompleted } = req.body;

      if (!entryId) {
        return res.status(400).json({ success: false, message: 'Parametr entryId jest wymagany w ścieżce URL.' });
      }

      if (isCompleted === undefined) {
        return res.status(400).json({ success: false, message: 'Parametr isCompleted jest wymagany w body.' });
      }

      // Teraz TypeScript jest już spokojny, bo entryId to na 100% pojedynczy string
      const result = await plansService.toggleEntryCompletion(entryId, isCompleted);
      
      return res.status(200).json({
        success: true,
        message: `Zaktualizowano status ćwiczenia. Aktualny postęp planu: ${result.newProgress}%`,
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
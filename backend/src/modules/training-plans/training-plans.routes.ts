import { Router } from 'express';
import { TrainingPlansController } from './training-plans.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const controller = new TrainingPlansController();

// 1. Tworzenie planu (Tylko zalogowany TRENER)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('TRAINER'),
  controller.create
);

// 2. Pobieranie planów przez zalogowanego klienta (Tylko CLIENT)
router.get(
  '/my',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('CLIENT'),
  controller.getMyPlans
);

// 3. Odznaczanie pojedynczego ćwiczenia z planu (Tylko CLIENT)
router.patch(
  '/entry/:entryId/toggle',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('CLIENT'),
  controller.toggleEntry
);

export default router;
import { Router } from 'express';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';
import { TrainingPlansController } from '../training-plans/training-plans.controller';

const router = Router();
const plansController = new TrainingPlansController();

// Pobranie planów treningowych dla wybranego klienta
router.get(
  '/:id/training-plans',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('TRAINER', 'ADMIN'),
  plansController.getClientPlansById
);

export default router;

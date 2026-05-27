import { Router } from 'express';
import { CalendarController } from './calendar.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const controller = new CalendarController();

// 1. Umówienie spotkania (Tylko zalogowany TRENER)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('TRAINER'),
  controller.create
);

// 2. Pobranie swojego grafiku (Zarówno CLIENT jak i TRAINER mają dostęp)
router.get(
  '/my',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('CLIENT', 'TRAINER'),
  controller.getMySchedule
);

// 3. Odwołanie terminu (Trener prowadzący lub Admin w sytuacjach kryzysowych)
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('TRAINER', 'ADMIN'),
  controller.delete
);

export default router;
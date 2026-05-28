import { Router } from 'express';
import { CalendarController } from './calendar.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const controller = new CalendarController();

// Wszystkie trasy kalendarza wymagają zalogowania (JWT)
router.use(passport.authenticate('jwt', { session: false }));

// 1. Umówienie spotkania / Wysłanie prośby o termin (Dostęp: CLIENT i TRAINER)
router.post(
  '/',
  authorizeRoles('CLIENT', 'TRAINER'),
  controller.create
);

// 2. Pobranie swojego grafiku (Zarówno CLIENT jak i TRAINER)
router.get(
  '/my',
  authorizeRoles('CLIENT', 'TRAINER'),
  controller.getMySchedule
);

// 3. Widok Booksy: Klient sprawdza zajętość wybranego trenera przed rezerwacją
router.get(
  '/trainer/:trainerId',
  authorizeRoles('CLIENT'),
  controller.getTrainerScheduleForClient
);

// 4. Decyzja trenera: Zatwierdzenie lub odrzucenie rezerwacji klienta
router.patch(
  '/:id/status',
  authorizeRoles('TRAINER'),
  controller.handleApproval
);

// 5. Odwołanie terminu (Zabezpieczone w serwisie przed obcymi osobami)
router.delete(
  '/:id',
  authorizeRoles('CLIENT', 'TRAINER', 'ADMIN'),
  controller.delete
);

export default router;
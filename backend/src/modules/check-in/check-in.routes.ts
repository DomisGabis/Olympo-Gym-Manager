import { Router } from 'express';
import { CheckInController } from './check-in.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const checkInController = new CheckInController();

// Podpięcie autoryzacji pod cały zestaw tras w tym pliku
router.use(passport.authenticate('jwt', { session: false }));
router.use(authorizeRoles('RECEPTIONIST', 'ADMIN'));

// Zamiast przedrostków w nazwach tras, ścieżki odzwierciedlają strukturę modułu
router.post('/in', checkInController.checkIn);
router.post('/out', checkInController.checkOut);

export default router;
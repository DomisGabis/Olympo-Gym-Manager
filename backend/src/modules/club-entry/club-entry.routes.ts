import { Router } from 'express';
import { ClubEntryController } from './club-entry.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const clubEntryController = new ClubEntryController();

// Każdy endpoint w tym module bezwzględnie wymaga zalogowania (Token JWT)
router.use(passport.authenticate('jwt', { session: false }));

// 1. Pobranie własnej historii wejść (Dostęp: WSZYSCY zalogowani) -> GET /api/club-entries/my
router.get(
  '/my', 
  authorizeRoles('CLIENT', 'TRAINER', 'RECEPTIONIST', 'ADMIN'), 
  clubEntryController.getMyHistory
);

// 2. Rejestracja wejścia (Tylko obsługa) -> POST /api/club-entries
router.post(
  '/', 
  authorizeRoles('RECEPTIONIST', 'ADMIN'), 
  clubEntryController.checkIn
);

// 3. Rejestracja wyjścia (Tylko obsługa) -> PATCH /api/club-entries
router.patch(
  '/', 
  authorizeRoles('RECEPTIONIST', 'ADMIN'), 
  clubEntryController.checkOut
);

export default router;
import { Router } from 'express';
import { MembershipsController } from './memberships.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const membershipsController = new MembershipsController();

// 1. Lista rodzajów karnetów - w pełni publiczna (dostępna przed zalogowaniem)
router.get('/types', membershipsController.getTypes);

// 2. Obsługa własnego karnetu - Wymaga zalogowania z rolą CLIENT
router.post(
  '/buy', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('CLIENT'), 
  membershipsController.buy
);

router.get(
  '/my', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('CLIENT'), 
  membershipsController.getMyMembership
);

// 3. Kontrola dostępu w klubie - Wymaga zalogowania z rolą RECEPTIONIST lub ADMIN
router.post(
  '/checkin',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('RECEPTIONIST', 'ADMIN'),
  membershipsController.checkIn
);

router.post(
  '/checkout',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('RECEPTIONIST', 'ADMIN'),
  membershipsController.checkOut
);

export default router;
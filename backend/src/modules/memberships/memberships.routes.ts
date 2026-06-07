import { Router } from 'express';
import { MembershipsController } from './memberships.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const membershipsController = new MembershipsController();

router.get('/', membershipsController.getTypes);

router.post(
  '/', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('RECEPTIONIST'), 
  membershipsController.buy
);

router.get(
  '/my', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('CLIENT'), 
  membershipsController.getMyMembership
);

// GET /api/memberships/user/:id
// Dla ADMIN i RECEPTIONIST: pobierz aktualny karnet wybranego użytkownika
router.get(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('ADMIN', 'RECEPTIONIST'),
  membershipsController.getMembershipByUserId
);

export default router;
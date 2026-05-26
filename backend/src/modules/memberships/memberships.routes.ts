import { Router } from 'express';
import { MembershipsController } from './memberships.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const membershipsController = new MembershipsController();

router.get('/types', membershipsController.getTypes);

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
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
  authorizeRoles('CLIENT'), 
  membershipsController.buy
);

router.get(
  '/my', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('CLIENT'), 
  membershipsController.getMyMembership
);

export default router;
import { Router } from 'express';
import { AuthController } from './auth.controller';
import passport from 'passport';
import { authorizeRoles } from './role.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);

export default router;
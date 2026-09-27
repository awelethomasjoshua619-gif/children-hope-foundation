import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import ah from '../middleware/asyncHandler';

const router = Router();

router.post('/register', authLimiter, ah(register));
router.post('/login', authLimiter, ah(login));
router.post('/logout', ah(logout));
router.get('/me', requireAuth, ah(me));

export default router;

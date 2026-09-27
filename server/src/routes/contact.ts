import { Router } from 'express';
import { submitContact } from '../controllers/contactController';
import { apiLimiter } from '../middleware/rateLimiter';
import ah from '../middleware/asyncHandler';

const router = Router();

router.post('/', apiLimiter, ah(submitContact));

export default router;

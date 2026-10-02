import { Router } from 'express';
import { getStats, getAllDonations } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/donations', getAllDonations);

export default router;

import { Router } from 'express';
import { getImpact } from '../controllers/impactController';
import { updateImpactStat, updateSiteSettings } from '../controllers/impactController';
import { authenticate, requireAdmin } from '../middleware/auth';
import ah from '../middleware/asyncHandler';

const router = Router();

// Public
router.get('/', ah(getImpact));

// Admin
router.put('/stats/:id', authenticate, requireAdmin, ah(updateImpactStat));
router.put('/settings', authenticate, requireAdmin, ah(updateSiteSettings));

export default router;

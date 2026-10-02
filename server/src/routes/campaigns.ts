import { Router } from 'express';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', listCampaigns);
router.get('/:slug', getCampaign);
router.post('/', authenticate, requireAdmin, createCampaign);
router.put('/:id', authenticate, requireAdmin, updateCampaign);
router.delete('/:id', authenticate, requireAdmin, deleteCampaign);

export default router;

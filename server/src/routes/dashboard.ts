import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getDashboard } from '../controllers/dashboardController';

const router = Router();

router.get('/', requireAuth, getDashboard);

export default router;

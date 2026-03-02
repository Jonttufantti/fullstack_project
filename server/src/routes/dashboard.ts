import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getDashboard } from '../controllers/dashboardController';

const router = Router();

router.get('/', authenticate, getDashboard);

export default router;

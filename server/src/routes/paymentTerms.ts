import { Router } from 'express';
import { getPaymentTerms, createPaymentTerm, deletePaymentTerm } from '../controllers/paymentTermController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getPaymentTerms);
router.post('/', createPaymentTerm);
router.delete('/:id', deletePaymentTerm);

export default router;

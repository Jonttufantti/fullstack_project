import { Router } from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
} from "../controllers/expenseController";
import { requireAuth } from "../middleware/authMiddleware";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);
router.post("/:id/receipt", upload.single("receipt"), uploadReceipt);

export default router;

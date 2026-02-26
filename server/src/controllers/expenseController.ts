import { Request, Response } from 'express';
import Expense from '../models/Expense';

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const expenses = await Expense.findAll({
    where: { userId },
    order: [['date', 'DESC']],
  });
  res.json(expenses);
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { amount, date, category, description } = req.body;

  if (!amount || !date || !category) {
    res.status(400).json({ error: 'amount, date and category are required' });
    return;
  }

  const expense = await Expense.create({ userId, amount, date, category, description });
  res.status(201).json(expense);
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const expense = await Expense.findOne({ where: { id: req.params.id, userId } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  const { amount, date, category, description } = req.body;
  await expense.update({
    amount: amount ?? expense.amount,
    date: date ?? expense.date,
    category: category ?? expense.category,
    description: description !== undefined ? description : expense.description,
  });
  res.json(expense);
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const expense = await Expense.findOne({ where: { id: req.params.id, userId } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  await expense.destroy();
  res.status(204).send();
};

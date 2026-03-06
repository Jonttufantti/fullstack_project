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
  const { subtotal, date, category, description, title, vatRate } = req.body;

  if (!subtotal || !date || !category) {
    res.status(400).json({ error: 'subtotal, date and category are required' });
    return;
  }

  const rate = vatRate ?? 0;
  const vatAmount = (Number(subtotal) * rate) / 100;
  const totalAmount = Number(subtotal) + vatAmount;
  const expense = await Expense.create({ userId, subtotal, date, category, description, title, vatRate: rate, vatAmount, totalAmount });
  res.status(201).json(expense);
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const expense = await Expense.findOne({ where: { id: req.params.id, userId } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  const { subtotal, date, category, description, title, vatRate } = req.body;
  const newSubtotal = subtotal ?? expense.subtotal;
  const newRate = vatRate !== undefined ? vatRate : expense.vatRate;
  const newVatAmount = (Number(newSubtotal) * Number(newRate)) / 100;
  await expense.update({
    subtotal: newSubtotal,
    date: date ?? expense.date,
    category: category ?? expense.category,
    description: description !== undefined ? description : expense.description,
    title: title !== undefined ? title : expense.title,
    vatRate: newRate,
    vatAmount: newVatAmount,
    totalAmount: Number(newSubtotal) + newVatAmount,
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

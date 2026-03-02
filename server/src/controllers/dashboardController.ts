import { Request, Response } from 'express';
import { fn, col, literal } from 'sequelize';
import Invoice from '../models/Invoice';
import Expense from '../models/Expense';
import Client from '../models/Client';

export const getDashboard = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  // Invoice summaries
  const invoiceAgg = await Invoice.findAll({
    where: { userId },
    attributes: [
      'status',
      [fn('SUM', col('totalAmount')), 'total'],
    ],
    group: ['status'],
    raw: true,
  }) as unknown as { status: string; total: string }[];

  const totalInvoiced = invoiceAgg.reduce((sum, r) => sum + parseFloat(r.total), 0);
  const totalPaid = parseFloat(invoiceAgg.find(r => r.status === 'paid')?.total ?? '0');
  const totalUnpaid = parseFloat(invoiceAgg.find(r => r.status === 'sent')?.total ?? '0');

  // Total expenses
  const expenseAgg = await Expense.findOne({
    where: { userId },
    attributes: [[fn('SUM', col('amount')), 'total']],
    raw: true,
  }) as unknown as { total: string | null };

  const totalExpenses = parseFloat(expenseAgg?.total ?? '0');

  // Monthly expenses for chart (last 6 months)
  const monthlyExpenses = await Expense.findAll({
    where: {
      userId,
      date: { [Symbol.for('gte')]: literal("NOW() - INTERVAL '6 months'") },
    },
    attributes: [
      [fn('TO_CHAR', col('date'), 'YYYY-MM'), 'month'],
      [fn('SUM', col('amount')), 'total'],
    ],
    group: [fn('TO_CHAR', col('date'), 'YYYY-MM')],
    order: [[fn('TO_CHAR', col('date'), 'YYYY-MM'), 'ASC']],
    raw: true,
  }) as unknown as { month: string; total: string }[];

  // 5 most recent invoices
  const recentInvoices = await Invoice.findAll({
    where: { userId },
    include: [{ model: Client, attributes: ['name'] }],
    order: [['issueDate', 'DESC']],
    limit: 5,
  });

  // 5 most recent expenses
  const recentExpenses = await Expense.findAll({
    where: { userId },
    order: [['date', 'DESC']],
    limit: 5,
  });

  res.json({
    totalInvoiced,
    totalPaid,
    totalUnpaid,
    totalExpenses,
    monthlyExpenses: monthlyExpenses.map(r => ({
      month: r.month,
      total: parseFloat(r.total),
    })),
    recentInvoices,
    recentExpenses,
  });
};

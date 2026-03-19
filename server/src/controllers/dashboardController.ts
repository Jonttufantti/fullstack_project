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
    attributes: [[fn('SUM', col('totalAmount')), 'total']],
    raw: true,
  }) as unknown as { total: string | null };

  const totalExpenses = parseFloat(expenseAgg?.total ?? '0');

  // Monthly expenses for chart — kassaperuste: vain rivit joilla paymentDate on asetettu
  const rawMonthlyExpenses = await Expense.findAll({
    where: {
      userId,
      paymentDate: {
        [Symbol.for('ne')]: null,
        [Symbol.for('gte')]: literal("DATE_TRUNC('month', NOW()) - INTERVAL '5 months'"),
      },
    },
    attributes: [
      [fn('TO_CHAR', col('paymentDate'), 'YYYY-MM'), 'month'],
      [fn('SUM', col('totalAmount')), 'total'],
    ],
    group: [fn('TO_CHAR', col('paymentDate'), 'YYYY-MM')],
    raw: true,
  }) as unknown as { month: string; total: string }[];

  // Monthly paid invoices for chart — same 6-month window, grouped by paymentDate (kassaperuste)
  const rawMonthlyInvoices = await Invoice.findAll({
    where: {
      userId,
      status: 'paid',
      paymentDate: { [Symbol.for('gte')]: literal("DATE_TRUNC('month', NOW()) - INTERVAL '5 months'") },
    },
    attributes: [
      [fn('TO_CHAR', col('paymentDate'), 'YYYY-MM'), 'month'],
      [fn('SUM', col('totalAmount')), 'total'],
    ],
    group: [fn('TO_CHAR', col('paymentDate'), 'YYYY-MM')],
    raw: true,
  }) as unknown as { month: string; total: string }[];

  const expenseByMonth = new Map(rawMonthlyExpenses.map(r => [r.month, parseFloat(r.total)]));
  const invoiceByMonth = new Map(rawMonthlyInvoices.map(r => [r.month, parseFloat(r.total)]));

  const now = new Date();
  const monthlyExpenses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month: key,
      expenses: expenseByMonth.get(key) ?? 0,
      invoices: invoiceByMonth.get(key) ?? 0,
    };
  });

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
    monthlyExpenses,
    recentInvoices,
    recentExpenses,
  });
};

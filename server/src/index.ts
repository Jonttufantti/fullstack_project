import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import invoiceRoutes from './routes/invoices';
import paymentTermRoutes from './routes/paymentTerms';
import expenseRoutes from './routes/expenses';
import PaymentTerm from './models/PaymentTerm';
import './models/Expense';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payment-terms', paymentTermRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.json({ status: 'ok', database: 'not connected' });
  }
});

const DEFAULT_PAYMENT_TERMS = [
  { label: '7 päivää netto', netDays: 7, discountPercent: null, discountDays: null },
  { label: '14 päivää netto', netDays: 14, discountPercent: null, discountDays: null },
  { label: '30 päivää netto', netDays: 30, discountPercent: null, discountDays: null },
  { label: '14 pv -2%, 30 päivää netto', netDays: 30, discountPercent: 2, discountDays: 14 },
];

const seedPaymentTerms = async () => {
  for (const term of DEFAULT_PAYMENT_TERMS) {
    await PaymentTerm.findOrCreate({
      where: { label: term.label, userId: null },
      defaults: term,
    });
  }
};

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedPaymentTerms();
    console.log('Database connection established and models synced.');
  } catch (error) {
    console.log('Database connection failed:', error);
    console.log('Server will start without database connection.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

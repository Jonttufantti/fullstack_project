import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.json({ status: 'ok', database: 'not connected' });
  }
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (error) {
    console.log('Database connection failed:', error);
    console.log('Server will start without database connection.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

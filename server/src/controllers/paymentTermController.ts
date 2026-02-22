import { Request, Response } from 'express';
import { Op } from 'sequelize';
import PaymentTerm from '../models/PaymentTerm';

export const getPaymentTerms = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  // Palautetaan järjestelmän oletukset (userId IS NULL) + käyttäjän omat
  const terms = await PaymentTerm.findAll({
    where: {
      [Op.or]: [{ userId: null }, { userId }],
    },
    order: [['netDays', 'ASC']],
  });
  res.json(terms);
};

export const createPaymentTerm = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { label, netDays, discountPercent, discountDays } = req.body;

  if (!label || !netDays) {
    res.status(400).json({ error: 'label and netDays are required' });
    return;
  }

  const term = await PaymentTerm.create({
    userId,
    label,
    netDays,
    discountPercent: discountPercent ?? null,
    discountDays: discountDays ?? null,
  });

  res.status(201).json(term);
};

export const deletePaymentTerm = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  // Käyttäjä voi poistaa vain omia ehtoja, ei järjestelmän oletuksia
  const term = await PaymentTerm.findOne({ where: { id: req.params.id, userId } });
  if (!term) {
    res.status(404).json({ error: 'Payment term not found' });
    return;
  }
  await term.destroy();
  res.status(204).send();
};

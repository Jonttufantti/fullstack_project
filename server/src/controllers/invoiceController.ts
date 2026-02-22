import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Invoice from '../models/Invoice';
import Client from '../models/Client';

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const invoices = await Invoice.findAll({
    where: { userId },
    include: [{ model: Client, attributes: ['name'] }],
    order: [['issueDate', 'DESC']],
  });
  res.json(invoices);
};

export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, userId },
    include: [{ model: Client, attributes: ['id', 'name', 'email', 'address'] }],
  });
  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }
  res.json(invoice);
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { clientId, issueDate, dueDate, subtotal, vatRate = 25.5, status = 'draft' } = req.body;

  if (!clientId || !issueDate || !dueDate || subtotal === undefined) {
    res.status(400).json({ error: 'clientId, issueDate, dueDate and subtotal are required' });
    return;
  }

  // Varmista että asiakas kuuluu tälle käyttäjälle
  const client = await Client.findOne({ where: { id: clientId, userId } });
  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  // Laske ALV-summa ja kokonaissumma backendissä
  const vatAmount = Number(subtotal) * Number(vatRate) / 100;
  const totalAmount = Number(subtotal) + vatAmount;

  // Generoi juokseva laskun numero: "2024-0001"
  const year = new Date(issueDate).getFullYear();
  const count = await Invoice.count({
    where: {
      userId,
      issueDate: {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      },
    },
  });
  const invoiceNumber = `${year}-${(count + 1).toString().padStart(4, '0')}`;

  const invoice = await Invoice.create({
    userId,
    clientId,
    invoiceNumber,
    issueDate,
    dueDate,
    status,
    subtotal,
    vatRate,
    vatAmount,
    totalAmount,
  });

  res.status(201).json(invoice);
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const invoice = await Invoice.findOne({ where: { id: req.params.id, userId } });
  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }

  const { issueDate, dueDate, subtotal, vatRate, status } = req.body;

  // Laske summat uudelleen jos subtotal tai vatRate muuttuu
  const newSubtotal = subtotal !== undefined ? Number(subtotal) : Number(invoice.subtotal);
  const newVatRate = vatRate !== undefined ? Number(vatRate) : Number(invoice.vatRate);
  const newVatAmount = newSubtotal * newVatRate / 100;
  const newTotalAmount = newSubtotal + newVatAmount;

  await invoice.update({
    issueDate: issueDate ?? invoice.issueDate,
    dueDate: dueDate ?? invoice.dueDate,
    subtotal: newSubtotal,
    vatRate: newVatRate,
    vatAmount: newVatAmount,
    totalAmount: newTotalAmount,
    status: status ?? invoice.status,
  });

  res.json(invoice);
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const invoice = await Invoice.findOne({ where: { id: req.params.id, userId } });
  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }
  await invoice.destroy();
  res.status(204).send();
};

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Invoice from '../models/Invoice';
import Client from '../models/Client';
import PaymentTerm from '../models/PaymentTerm';
import User from '../models/User';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

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
  const { clientId, issueDate, subtotal, vatRate = 25.5, status = 'draft', paymentTermId } = req.body;

  if (!clientId || !issueDate || subtotal === undefined || !paymentTermId) {
    res.status(400).json({ error: 'clientId, issueDate, subtotal and paymentTermId are required' });
    return;
  }

  // Varmista että asiakas kuuluu tälle käyttäjälle
  const client = await Client.findOne({ where: { id: clientId, userId } });
  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  // Hae maksuehto ja laske eräpäivä: laskun päiväys + nettopäivät
  const paymentTerm = await PaymentTerm.findByPk(paymentTermId);
  if (!paymentTerm) {
    res.status(404).json({ error: 'Payment term not found' });
    return;
  }
  const dueDate = addDays(issueDate, paymentTerm.netDays);

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

  const created = await Invoice.create({
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
    paymentTermId,
    // Snapshot — säilyy vaikka maksuehto myöhemmin muuttuisi tai poistuisi
    discountPercent: paymentTerm.discountPercent,
    discountDays: paymentTerm.discountDays,
  });

  // Haetaan uudelleen Client-assosiaatioineen, jotta frontend saa asiakkaan nimen
  const invoice = await Invoice.findOne({
    where: { id: created.id },
    include: [{ model: Client, attributes: ['id', 'name', 'email', 'address'] }],
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

  const { issueDate, dueDate, subtotal, vatRate, status, discountPercent, discountDays } = req.body;

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
    discountPercent: discountPercent !== undefined ? discountPercent : invoice.discountPercent,
    discountDays: discountDays !== undefined ? discountDays : invoice.discountDays,
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

export const downloadInvoicePdf = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const invoice = await Invoice.findOne({
    where: { id: req.params.id, userId },
    include: [{ model: Client }],
  });
  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const client = (invoice as any).Client as Client;

  const pdfBuffer = generateInvoicePdf({
    invoiceNumber: invoice.invoiceNumber,
    issueDate: String(invoice.issueDate),
    dueDate: String(invoice.dueDate),
    subtotal: Number(invoice.subtotal),
    vatRate: Number(invoice.vatRate),
    vatAmount: Number(invoice.vatAmount),
    totalAmount: Number(invoice.totalAmount),
    discountPercent: invoice.discountPercent ? Number(invoice.discountPercent) : null,
    discountDays: invoice.discountDays ?? null,
    seller: {
      name: user.name,
      email: user.email,
      businessId: user.businessId,
      address: user.address,
      iban: user.iban,
    },
    buyer: {
      name: client.name,
      email: client.email ?? null,
      address: client.address ?? null,
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="lasku-${invoice.invoiceNumber}.pdf"`
  );
  res.send(pdfBuffer);
};

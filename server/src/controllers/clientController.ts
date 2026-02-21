import { Request, Response } from 'express';
import Client from '../models/Client';

export const getClients = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const clients = await Client.findAll({ where: { userId } });
  res.json(clients);
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { name, email, phone, address } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const client = await Client.create({ userId, name, email, phone, address });
  res.status(201).json(client);
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const client = await Client.findOne({ where: { id: req.params.id, userId } });
  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }
  const { name, email, phone, address } = req.body;
  await client.update({ name, email, phone, address });
  res.json(client);
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const client = await Client.findOne({ where: { id: req.params.id, userId } });
  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }
  await client.destroy();
  res.status(204).send();
};

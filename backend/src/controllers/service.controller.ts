import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';

const createServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  unit: z.string().default('kg'),
  price: z.number().positive(),
  isActive: z.boolean().default(true),
});

const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const getAllServices = async (req: AuthRequest, res: Response) => {
  try {
    const { active } = req.query;

    const where = active === 'true' ? { isActive: true } : {};

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

export const getServiceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const data = createServiceSchema.parse(req.body);

    const service = await prisma.service.create({
      data,
    });

    res.status(201).json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create service' });
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateServiceSchema.parse(req.body);

    const service = await prisma.service.update({
      where: { id },
      data,
    });

    res.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update service' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({ where: { id } });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

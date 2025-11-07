import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return public information only
    const publicOrder = {
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      pickupDate: order.pickupDate,
      deliveryDate: order.deliveryDate,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        service: item.service.name,
        quantity: item.quantity,
        unit: item.service.unit,
        subtotal: item.subtotal,
      })),
      statusHistory: order.statusHistory.map((history) => ({
        status: history.status,
        notes: history.notes,
        timestamp: history.createdAt,
      })),
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
    };

    res.json(publicOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track order' });
  }
};

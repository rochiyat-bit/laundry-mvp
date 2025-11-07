import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { generateQRCode } from '../utils/qrcode';
import { AuthRequest } from '../types';

const createOrderSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(
    z.object({
      serviceId: z.string(),
      quantity: z.number().positive(),
    })
  ),
  notes: z.string().optional(),
  pickupDate: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'WASHING',
    'DRYING',
    'IRONING',
    'READY',
    'DELIVERED',
    'CANCELLED',
  ]),
  notes: z.string().optional(),
});

const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `LDR${year}${month}${day}${random}`;
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items, notes, pickupDate } = createOrderSchema.parse(req.body);

    // Use authenticated user as customer if not specified (for staff creating orders)
    const finalCustomerId = customerId || req.user?.id;

    if (!finalCustomerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Fetch services with prices
    const serviceIds = items.map((item) => item.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length !== serviceIds.length) {
      return res.status(400).json({ error: 'Some services not found' });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const service = services.find((s) => s.id === item.serviceId);
      if (!service) throw new Error('Service not found');

      const subtotal = service.price * item.quantity;
      totalAmount += subtotal;

      return {
        serviceId: item.serviceId,
        quantity: item.quantity,
        price: service.price,
        subtotal,
      };
    });

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: finalCustomerId,
        totalAmount,
        notes,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            notes: 'Order created',
          },
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Generate tracking URL and QR code
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const trackingUrl = `${frontendUrl}/tracking/${order.orderNumber}`;
    const qrCode = await generateQRCode(trackingUrl);

    // Update order with tracking URL and QR code
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        trackingUrl,
        qrCode,
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, customerId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    // If user is customer, only show their orders
    if (req.user?.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (customerId) {
      where.customerId = customerId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has permission to view this order
    if (
      req.user?.role === 'CUSTOMER' &&
      order.customerId !== req.user.id
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const getOrderByNumber = async (req: AuthRequest, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = updateOrderStatusSchema.parse(req.body);

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        deliveryDate: status === 'DELIVERED' ? new Date() : undefined,
        statusHistory: {
          create: {
            status,
            notes,
          },
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({ where: { id } });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

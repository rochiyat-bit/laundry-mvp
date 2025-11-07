import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.get('/number/:orderNumber', getOrderByNumber);
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), updateOrderStatus);
router.delete('/:id', authorize('ADMIN'), deleteOrder);

export default router;

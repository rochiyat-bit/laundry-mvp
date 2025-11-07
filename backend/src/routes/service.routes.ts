import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected routes
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), createService);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), updateService);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteService);

export default router;

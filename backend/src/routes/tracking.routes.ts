import { Router } from 'express';
import { trackOrder } from '../controllers/tracking.controller';

const router = Router();

// Public tracking route (no authentication required)
router.get('/:orderNumber', trackOrder);

export default router;

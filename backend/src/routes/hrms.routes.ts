import { Router } from 'express';
import { getEmployees, clockIn, clockOut, getLeaves, requestLeave, approveLeave } from '../controllers/hrms.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/employees', getEmployees);

// Attendance routes
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);

// Leaves routes
router.get('/leaves', getLeaves);
router.post('/leaves/request', requestLeave);
router.put('/leaves/:id/approve', authorize('ALL_ACCESS'), approveLeave); // Simple guard for admin level approvals

export default router;

import { Router } from 'express';
import { getTickets, createTicket, updateTicket } from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(authorize('TICKET_MANAGE'), getTickets)
  .post(authorize('TICKET_MANAGE'), createTicket);

router.route('/:id')
  .put(authorize('TICKET_MANAGE'), updateTicket);

export default router;

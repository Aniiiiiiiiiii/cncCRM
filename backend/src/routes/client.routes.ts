import { Router } from 'express';
import { getClients, getClient, createClient, updateClient } from '../controllers/client.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(authorize('LEAD_VIEW'), getClients)
  .post(authorize('LEAD_CREATE'), createClient);

router.route('/:id')
  .get(authorize('LEAD_VIEW'), getClient)
  .put(authorize('LEAD_EDIT'), updateClient);

export default router;

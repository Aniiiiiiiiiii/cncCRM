import { Router } from 'express';
import { getLeads, getLead, createLead, updateLead, deleteLead, importLeads } from '../controllers/lead.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(authorize('LEAD_VIEW'), getLeads)
  .post(authorize('LEAD_CREATE'), createLead);

router.post('/import', authorize('LEAD_CREATE'), importLeads);

router.route('/:id')
  .get(authorize('LEAD_VIEW'), getLead)
  .put(authorize('LEAD_EDIT'), updateLead)
  .delete(authorize('LEAD_DELETE'), deleteLead);

export default router;

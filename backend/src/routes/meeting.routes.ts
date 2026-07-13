import { Router } from 'express';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting } from '../controllers/meeting.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getMeetings)
  .post(createMeeting);

router.route('/:id')
  .put(updateMeeting)
  .delete(deleteMeeting);

export default router;

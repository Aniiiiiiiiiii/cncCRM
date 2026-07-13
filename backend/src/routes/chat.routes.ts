import { Router } from 'express';
import { getMyChatGroups, getMessages, sendMessage, startDirectMessage } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/groups', getMyChatGroups);
router.post('/direct', startDirectMessage);
router.get('/groups/:groupId/messages', getMessages);
router.post('/groups/:groupId/messages', sendMessage);

export default router;

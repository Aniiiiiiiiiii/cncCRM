import { Router } from 'express';
import { getDocuments, createFolder, uploadDocument } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/folder', createFolder);
router.post('/upload', upload.single('file'), uploadDocument);

export default router;

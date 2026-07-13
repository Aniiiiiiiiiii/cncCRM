import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, createTask, updateTask } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(authorize('PROJECT_VIEW'), getProjects)
  .post(authorize('PROJECT_CREATE'), createProject);

router.route('/:id')
  .get(authorize('PROJECT_VIEW'), getProject)
  .put(authorize('PROJECT_EDIT'), updateProject);

// Tasks routes
router.post('/tasks/create', authorize('TASK_MANAGE'), createTask);
router.put('/tasks/:id', authorize('TASK_MANAGE'), updateTask);

export default router;

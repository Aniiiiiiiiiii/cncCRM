import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';

export const getProjects = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status, clientId, managerId } = req.query;

  const whereClause: any = {};
  if (status) whereClause.status = status as ProjectStatus;
  if (clientId) whereClause.clientId = clientId as string;
  if (managerId) whereClause.managerId = managerId as string;

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      client: { select: { id: true, companyName: true, contactName: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: projects.length,
    projects,
  });
});

export const getProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true, contactName: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      },
      milestones: {
        include: {
          tasks: {
            include: {
              assignee: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      },
      tasks: {
        where: { milestoneId: null }, // Orphan tasks not assigned to milstones
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    project,
  });
});

export const createProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, status, startDate, endDate, budget, clientId, managerId, memberIds } = req.body;

  if (!name) {
    return next(new AppError('Project name is required.', 400));
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status: status || ProjectStatus.PLANNING,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: budget ? Number(budget) : null,
      clientId,
      managerId,
    },
  });

  // Assign members if provided
  if (Array.isArray(memberIds) && memberIds.length > 0) {
    const memberData = memberIds.map((uId: string) => ({
      projectId: project.id,
      userId: uId,
      role: 'Contributor',
    }));
    await prisma.projectMember.createMany({ data: memberData });
  }

  await prisma.activity.create({
    data: {
      action: 'PROJECT_CREATED',
      description: `Project "${name}" was created.`,
      projectId: project.id,
    },
  });

  res.status(201).json({
    status: 'success',
    project,
  });
});

export const updateProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, status, startDate, endDate, budget, clientId, managerId } = req.body;

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget ? Number(budget) : undefined,
      clientId,
      managerId,
    },
  });

  res.status(200).json({
    status: 'success',
    project: updatedProject,
  });
});

// Tasks & Milestones
export const createTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, priority, status, dueDate, projectId, milestoneId, assigneeId } = req.body;

  if (!title) {
    return next(new AppError('Task title is required.', 400));
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || TaskPriority.MEDIUM,
      status: status || TaskStatus.TODO,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      milestoneId,
      assigneeId,
      creatorId: req.user!.id,
    },
  });

  // If there is an assignee, send real-time notification
  if (assigneeId) {
    await prisma.notification.create({
      data: {
        userId: assigneeId,
        title: 'New Task Assigned',
        message: `You have been assigned to task: "${title}"`,
        type: 'TASK_ASSIGNED',
      },
    });
  }

  res.status(201).json({
    status: 'success',
    task,
  });
});

export const updateTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate, assigneeId, timeSpent } = req.body;

  const existingTask = await prisma.task.findUnique({ where: { id } });
  if (!existingTask) {
    return next(new AppError('Task not found.', 404));
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assigneeId,
      timeSpent: timeSpent ? Number(timeSpent) : undefined,
    },
  });

  res.status(200).json({
    status: 'success',
    task: updatedTask,
  });
});

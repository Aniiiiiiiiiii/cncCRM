import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const getDocuments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { folderId } = req.query;

  const folders = await prisma.folder.findMany({
    where: { parentId: folderId ? (folderId as string) : null },
  });

  const documents = await prisma.document.findMany({
    where: { folderId: folderId ? (folderId as string) : null },
  });

  res.status(200).json({
    status: 'success',
    folders,
    documents,
  });
});

export const createFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, parentId } = req.body;

  if (!name) {
    return next(new AppError('Folder name is required.', 400));
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      parentId,
      createdById: req.user!.id,
    },
  });

  res.status(201).json({
    status: 'success',
    folder,
  });
});

export const uploadDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { folderId, contactId, taskId } = req.body;
  const file = req.file;

  if (!file) {
    return next(new AppError('Please provide a file to upload.', 400));
  }

  const doc = await prisma.document.create({
    data: {
      name: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      folderId: folderId || null,
      contactId: contactId || null,
      taskId: taskId || null,
      ownerId: req.user!.id,
    },
  });

  res.status(201).json({
    status: 'success',
    document: doc,
  });
});

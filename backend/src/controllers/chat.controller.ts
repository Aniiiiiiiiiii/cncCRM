import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { io } from '../server';
import { sendChatMessage } from '../config/socket';

export const getMyChatGroups = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  const chatGroups = await prisma.chatGroupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    groups: chatGroups.map((g) => g.group),
  });
});

export const getMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;

  const messages = await prisma.message.findMany({
    where: { groupId },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    messages,
  });
});

export const sendMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { content } = req.body;
  const senderId = req.user!.id;

  if (!content) {
    return next(new AppError('Message content is required.', 400));
  }

  const msg = await prisma.message.create({
    data: {
      content,
      groupId,
      senderId,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });

  // Fetch all members in this group to distribute socket broadcasts
  const members = await prisma.chatGroupMember.findMany({
    where: { groupId },
  });

  // Broadcast via socket to all other online members
  for (const m of members) {
    if (m.userId !== senderId) {
      sendChatMessage(io, m.userId, msg);
    }
  }

  res.status(201).json({
    status: 'success',
    message: msg,
  });
});

export const startDirectMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { targetUserId } = req.body;
  const senderId = req.user!.id;

  if (!targetUserId) {
    return next(new AppError('Please provide targetUserId.', 400));
  }

  // Create chat group with direct message set to true
  const group = await prisma.chatGroup.create({
    data: {
      isDirect: true,
    },
  });

  // Add both members
  await prisma.chatGroupMember.createMany({
    data: [
      { groupId: group.id, userId: senderId },
      { groupId: group.id, userId: targetUserId },
    ],
  });

  res.status(201).json({
    status: 'success',
    group,
  });
});

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import crypto from 'crypto';

export const getMeetings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { hostId } = req.query;

  const whereClause: any = {};
  if (hostId) whereClause.hostId = hostId as string;

  const meetings = await prisma.meeting.findMany({
    where: whereClause,
    include: {
      host: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { startTime: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    results: meetings.length,
    meetings,
  });
});

export const createMeeting = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, startTime, endTime, type, location, participants, hostId } = req.body;

  if (!title || !startTime || !endTime || !hostId) {
    return next(new AppError('Title, Start time, End time, and Host are required.', 400));
  }

  // Simulate Google & Outlook OAuth Calendar Synchronization IDs
  const googleEventId = `gcal_${crypto.randomBytes(8).toString('hex')}`;
  const outlookEventId = `out_${crypto.randomBytes(8).toString('hex')}`;

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type: type || 'MEETING',
      location,
      participants: participants ? (typeof participants === 'string' ? participants : JSON.stringify(participants)) : null,
      googleEventId,
      outlookEventId,
      hostId,
    },
  });

  res.status(201).json({
    status: 'success',
    meeting,
  });
});

export const updateMeeting = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, description, startTime, endTime, type, location, participants, hostId } = req.body;

  const existingMeeting = await prisma.meeting.findUnique({ where: { id } });
  if (!existingMeeting) {
    return next(new AppError('Meeting not found.', 404));
  }

  const updatedMeeting = await prisma.meeting.update({
    where: { id },
    data: {
      title,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      type,
      location,
      participants: participants ? (typeof participants === 'string' ? participants : JSON.stringify(participants)) : undefined,
      hostId,
    },
  });

  res.status(200).json({
    status: 'success',
    meeting: updatedMeeting,
  });
});

export const deleteMeeting = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) {
    return next(new AppError('Meeting not found.', 404));
  }

  await prisma.meeting.delete({ where: { id } });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { TicketStatus, TicketPriority } from '@prisma/client';

export const getTickets = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status, priority, assigneeId } = req.query;

  const whereClause: any = {};
  if (status) whereClause.status = status as TicketStatus;
  if (priority) whereClause.priority = priority as TicketPriority;
  if (assigneeId) whereClause.assigneeId = assigneeId as string;

  const tickets = await prisma.ticket.findMany({
    where: whereClause,
    include: {
      category: true,
      assignee: { select: { id: true, firstName: true, lastName: true } },
      client: { select: { id: true, companyName: true, contactName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    tickets,
  });
});

export const createTicket = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { subject, description, priority, categoryId, clientId, assigneeId } = req.body;

  if (!subject || !description || !clientId) {
    return next(new AppError('Subject, Description, and Client are required.', 400));
  }

  // Generate unique ticket number
  const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

  // Standard SLA is 48 hours for general priority, 24 for high, 4 for urgent
  let slaHours = 48;
  if (priority === TicketPriority.HIGH) slaHours = 24;
  if (priority === TicketPriority.URGENT) slaHours = 4;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      subject,
      description,
      priority: priority || TicketPriority.LOW,
      status: TicketStatus.OPEN,
      slaDeadline,
      categoryId,
      clientId,
      assigneeId,
    },
  });

  res.status(201).json({
    status: 'success',
    ticket,
  });
});

export const updateTicket = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, priority, assigneeId } = req.body;

  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: {
      status,
      priority,
      assigneeId,
    },
  });

  res.status(200).json({
    status: 'success',
    ticket: updatedTicket,
  });
});

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const getClients = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { search } = req.query;

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { companyName: { contains: search as string } },
      { contactName: { contains: search as string } },
      { email: { contains: search as string } },
    ];
  }

  const clients = await prisma.client.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: clients.length,
    clients,
  });
});

export const getClient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: true,
      invoices: true,
      tickets: true,
    },
  });

  if (!client) {
    return next(new AppError('Client not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    client,
  });
});

export const createClient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { companyName, contactName, email, phone, website, status, address } = req.body;

  if (!companyName || !contactName || !email) {
    return next(new AppError('Company name, Contact name, and Email are required.', 400));
  }

  const client = await prisma.client.create({
    data: {
      companyName,
      contactName,
      email,
      phone,
      website,
      status: status || 'ACTIVE',
      address,
    },
  });

  res.status(201).json({
    status: 'success',
    client,
  });
});

export const updateClient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { companyName, contactName, email, phone, website, status, address } = req.body;

  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      companyName,
      contactName,
      email,
      phone,
      website,
      status,
      address,
    },
  });

  res.status(200).json({
    status: 'success',
    client: updatedClient,
  });
});

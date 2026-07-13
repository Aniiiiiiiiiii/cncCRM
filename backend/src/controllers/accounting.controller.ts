import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { InvoiceStatus, ExpenseStatus } from '@prisma/client';

export const getInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const invoices = await prisma.invoice.findMany({
    include: {
      client: { select: { id: true, companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    invoices,
  });
});

export const createInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { clientId, issueDate, dueDate, taxRate, discount, items } = req.body;

  if (!clientId || !issueDate || !dueDate || !items) {
    return next(new AppError('ClientId, IssueDate, DueDate, and Items are required.', 400));
  }

  // Generate unique invoice number
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  // Parse items
  const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
  if (!Array.isArray(parsedItems)) {
    return next(new AppError('Items must be an array.', 400));
  }

  // Calculate totals
  let subtotal = 0;
  for (const it of parsedItems) {
    subtotal += Number(it.amount);
  }

  const tax = subtotal * (Number(taxRate || 18.0) / 100);
  const total = subtotal + tax - Number(discount || 0);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      taxRate: Number(taxRate || 18.0),
      discount: Number(discount || 0),
      subtotal,
      total,
      items: JSON.stringify(parsedItems),
      status: InvoiceStatus.UNPAID,
    },
  });

  res.status(201).json({
    status: 'success',
    invoice,
  });
});

export const getExpenses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const expenses = await prisma.expense.findMany({
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    expenses,
  });
});

export const createExpense = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { amount, category, date, description, receiptUrl } = req.body;

  if (!amount || !category || !date) {
    return next(new AppError('Amount, Category, and Date are required.', 400));
  }

  const expense = await prisma.expense.create({
    data: {
      amount: Number(amount),
      category,
      date: new Date(date),
      description,
      receiptUrl,
      status: ExpenseStatus.PENDING,
      createdById: req.user!.id,
    },
  });

  res.status(201).json({
    status: 'success',
    expense,
  });
});

export const approveExpense = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  if (![ExpenseStatus.APPROVED, ExpenseStatus.REJECTED].includes(status)) {
    return next(new AppError('Invalid expense status.', 400));
  }

  const updatedExpense = await prisma.expense.update({
    where: { id },
    data: {
      status: status as ExpenseStatus,
      approvedById: req.user!.id,
    },
  });

  res.status(200).json({
    status: 'success',
    expense: updatedExpense,
  });
});

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { LeadStatus } from '@prisma/client';

export const getLeads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { search, status, assignedToId } = req.query;

  const whereClause: any = {};

  if (status) {
    whereClause.status = status as LeadStatus;
  }

  if (assignedToId) {
    whereClause.assignedToId = assignedToId as string;
  }

  if (search) {
    whereClause.OR = [
      { firstName: { contains: search as string } },
      { lastName: { contains: search as string } },
      { email: { contains: search as string } },
      { company: { contains: search as string } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where: whereClause,
    include: {
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: leads.length,
    leads,
  });
});

export const getLead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
      },
      timeline: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!lead) {
    return next(new AppError('Lead not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    lead,
  });
});

export const createLead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, phone, priority, company, title, source, score, notes, tags, assignedToId } = req.body;

  if (!firstName) {
    return next(new AppError('First name is required.', 400));
  }

  const lead = await prisma.lead.create({
    data: {
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
      priority,
      company: company || null,
      title: title || null,
      source: source || null,
      score: score ? Number(score) : 0,
      notes: notes || null,
      tags: tags || null,
      assignedToId: assignedToId || null,
      createdById: req.user!.id,
    },
  });

  // Track activity
  await prisma.activity.create({
    data: {
      action: 'LEAD_CREATED',
      description: `Lead created for ${firstName} ${lastName || ''} from ${source || 'Unknown'}.`,
      leadId: lead.id,
    },
  });

  // Track timeline
  await prisma.timeline.create({
    data: {
      title: 'Lead Created',
      description: 'Lead entered the system.',
      leadId: lead.id,
    },
  });

  res.status(201).json({
    status: 'success',
    lead,
  });
});

export const updateLead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, priority, company, title, status, source, score, notes, tags, assignedToId } = req.body;

  const existingLead = await prisma.lead.findUnique({ where: { id } });
  if (!existingLead) {
    return next(new AppError('Lead not found.', 404));
  }

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      firstName,
      lastName: lastName === '' ? null : lastName,
      email: email === '' ? null : email,
      phone: phone === '' ? null : phone,
      priority,
      company: company === '' ? null : company,
      title: title === '' ? null : title,
      status,
      source: source === '' ? null : source,
      score: score ? Number(score) : undefined,
      notes: notes === '' ? null : notes,
      tags: tags === '' ? null : tags,
      assignedToId,
    },
  });

  // Check if status changed
  if (status && status !== existingLead.status) {
    await prisma.activity.create({
      data: {
        action: 'STAGE_CHANGED',
        description: `Lead stage changed from ${existingLead.status} to ${status}.`,
        leadId: id,
      },
    });

    await prisma.timeline.create({
      data: {
        title: 'Stage Changed',
        description: `Stage moved to ${status}.`,
        leadId: id,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    lead: updatedLead,
  });
});

export const deleteLead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return next(new AppError('Lead not found.', 404));
  }

  await prisma.lead.delete({ where: { id } });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Import multiple leads via JSON post
export const importLeads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { leads } = req.body; // Expects an array of leads

  if (!Array.isArray(leads)) {
    return next(new AppError('Please provide an array of leads to import.', 400));
  }

  const createdLeads = [];
  for (const l of leads) {
    if (l.firstName) {
      const created = await prisma.lead.create({
        data: {
          firstName: l.firstName,
          lastName: l.lastName || null,
          email: l.email || null,
          phone: l.phone || null,
          priority: l.priority || 'MEDIUM',
          company: l.company || null,
          title: l.title || null,
          status: l.status || LeadStatus.NEW,
          source: l.source || 'Imported',
          score: l.score ? Number(l.score) : 10,
          notes: l.notes || null,
          tags: l.tags || null,
          createdById: req.user!.id,
        },
      });
      createdLeads.push(created);
    }
  }

  res.status(200).json({
    status: 'success',
    message: `Successfully imported ${createdLeads.length} leads.`,
    leads: createdLeads,
  });
});

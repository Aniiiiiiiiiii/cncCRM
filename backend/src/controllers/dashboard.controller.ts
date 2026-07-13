import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';
import { LeadStatus, ProjectStatus, TicketStatus } from '@prisma/client';

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Revenue sums
  const paidInvoices = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: 'PAID' },
  });

  const unpaidInvoices = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: 'UNPAID' },
  });

  const totalRevenue = Number(paidInvoices._sum.total || 0);
  const pendingRevenue = Number(unpaidInvoices._sum.total || 0);

  // 2) Leads stages counts
  const leadsCount = await prisma.lead.count();
  const leadsByStatus = await prisma.lead.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  // 3) Active Projects
  const activeProjects = await prisma.project.count({
    where: { status: ProjectStatus.IN_PROGRESS },
  });

  // 4) Tickets status counts
  const openTickets = await prisma.ticket.count({
    where: { status: TicketStatus.OPEN },
  });
  const resolvedTickets = await prisma.ticket.count({
    where: { status: TicketStatus.RESOLVED },
  });

  // 5) Team Productivity (Attendance rate today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const presentToday = await prisma.attendance.count({
    where: { date: today },
  });
  const totalEmployees = await prisma.employee.count();

  // 6) Invoices ledger (Last 5)
  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { companyName: true } } },
  });

  // 7) Leads Funnel representation
  const funnelData = [
    { name: 'New', value: await prisma.lead.count({ where: { status: LeadStatus.NEW } }) },
    { name: 'Contacted', value: await prisma.lead.count({ where: { status: LeadStatus.CONTACTED } }) },
    { name: 'Qualified', value: await prisma.lead.count({ where: { status: LeadStatus.QUALIFIED } }) },
    { name: 'Proposal Sent', value: await prisma.lead.count({ where: { status: LeadStatus.PROPOSAL_SENT } }) },
    { name: 'Negotiation', value: await prisma.lead.count({ where: { status: LeadStatus.NEGOTIATION } }) },
    { name: 'Won', value: await prisma.lead.count({ where: { status: LeadStatus.WON } }) },
    { name: 'Lost', value: await prisma.lead.count({ where: { status: LeadStatus.LOST } }) },
  ];

  // 8) Lead Sources distribution
  const leadSourcesRaw = await prisma.lead.groupBy({
    by: ['source'],
    _count: { id: true },
  });
  const leadSources = leadSourcesRaw.map(s => ({
    name: s.source || 'Unknown',
    value: s._count.id,
  }));

  res.status(200).json({
    status: 'success',
    stats: {
      totalRevenue,
      pendingRevenue,
      leadsCount,
      activeProjects,
      tickets: {
        open: openTickets,
        resolved: resolvedTickets,
      },
      hrms: {
        totalEmployees,
        presentToday,
      },
      leadsByStatus,
      funnelData,
      leadSources,
      recentInvoices,
    },
  });
});

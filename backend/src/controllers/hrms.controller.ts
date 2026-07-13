import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { AttendanceStatus, LeaveStatus, LeaveType } from '@prisma/client';

export const getEmployees = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { departmentId } = req.query;

  const whereClause: any = {};
  if (departmentId) whereClause.departmentId = departmentId as string;

  const employees = await prisma.employee.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, status: true } },
      department: true,
      designation: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: employees.length,
    employees,
  });
});

export const clockIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    return next(new AppError('No employee profile associated with this user.', 404));
  }

  // Check if already clocked in today
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      employeeId: employee.id,
      date: today,
    },
  });

  if (existingAttendance) {
    return next(new AppError('You have already clocked in today.', 400));
  }

  const attendance = await prisma.attendance.create({
    data: {
      date: today,
      clockIn: new Date(),
      status: AttendanceStatus.PRESENT,
      ipAddress: req.ip,
      employeeId: employee.id,
    },
  });

  res.status(201).json({
    status: 'success',
    attendance,
  });
});

export const clockOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    return next(new AppError('No employee profile associated with this user.', 404));
  }

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId: employee.id,
      date: today,
    },
  });

  if (!attendance) {
    return next(new AppError('No clock-in record found for today.', 400));
  }

  if (attendance.clockOut) {
    return next(new AppError('You have already clocked out today.', 400));
  }

  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      clockOut: new Date(),
    },
  });

  res.status(200).json({
    status: 'success',
    attendance: updatedAttendance,
  });
});

export const getLeaves = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const leaves = await prisma.leave.findMany({
    include: {
      employee: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    leaves,
  });
});

export const requestLeave = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const userId = req.user!.id;

  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) {
    return next(new AppError('Employee profile not found.', 404));
  }

  const leave = await prisma.leave.create({
    data: {
      leaveType: leaveType as LeaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: LeaveStatus.PENDING,
      employeeId: employee.id,
    },
  });

  res.status(201).json({
    status: 'success',
    leave,
  });
});

export const approveLeave = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  if (![LeaveStatus.APPROVED, LeaveStatus.REJECTED].includes(status)) {
    return next(new AppError('Invalid status provided.', 400));
  }

  const updatedLeave = await prisma.leave.update({
    where: { id },
    data: {
      status: status as LeaveStatus,
      approvedById: req.user!.id,
    },
  });

  res.status(200).json({
    status: 'success',
    leave: updatedLeave,
  });
});

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import AuthService from '../services/auth.service';

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (user.status !== 'ACTIVE') {
    return next(new AppError('Your account has been suspended or deactivated.', 403));
  }

  const { accessToken, refreshToken } = AuthService.generateTokens({
    id: user.id,
    email: user.email,
  });

  // Log audit trail
  await AuthService.logAudit(
    user.id,
    'LOGIN',
    'AUTH',
    { ip: req.ip },
    req.ip,
    req.headers['user-agent']
  );

  res.status(200).json({
    status: 'success',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions.map((rp) => rp.permission.code),
      },
    },
  });
});

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('You are not logged in.', 401));
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions.map((rp) => rp.permission.code),
      },
    },
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide currentPassword and newPassword.', 400));
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Incorrect current password.', 401));
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: passwordHash },
  });

  await AuthService.logAudit(
    user.id,
    'CHANGE_PASSWORD',
    'AUTH',
    null,
    req.ip,
    req.headers['user-agent']
  );

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully.',
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address.', 400));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  // Since we assume an active email SMTP setup as requested, we would send this via Nodemailer.
  // We will print this to console for easy testing during development, and mock it.
  console.log(`✉️ Forgot password reset request for: ${email}`);
  console.log(`🔗 Token link: http://localhost:3000/reset-password?token=${resetToken}`);

  res.status(200).json({
    status: 'success',
    message: 'Reset token sent to email.',
    // Sending it in response for debugging simplicity during local testing
    resetToken,
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Please provide token and password.', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful. You can now login.',
  });
});

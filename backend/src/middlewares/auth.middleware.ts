import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { prisma } from '../config/database';
import { env } from '../config/env';

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2) Verification of token
  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3) Check if user still exists
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
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

  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (currentUser.status !== 'ACTIVE') {
    return next(new AppError('This user account is currently inactive.', 403));
  }

  // 4) Grant access to protected route and attach user to Request
  req.user = {
    id: currentUser.id,
    email: currentUser.email,
    role: {
      id: currentUser.role.id,
      name: currentUser.role.name,
      permissions: currentUser.role.permissions,
    },
  };

  next();
});

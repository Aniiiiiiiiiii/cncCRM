import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const authorize = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const { role } = req.user;

    // Super Admin bypasses all permission checks
    if (role.name === 'Super Admin') {
      return next();
    }

    const userPermissions = role.permissions.map(
      (rp) => rp.permission.code
    );

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: {
          id: string;
          name: string;
          permissions: {
            permission: {
              code: string;
            };
          }[];
        };
      };
    }
  }
}

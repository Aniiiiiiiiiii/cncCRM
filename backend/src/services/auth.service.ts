import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';

export class AuthService {
  public static generateTokens(user: { id: string; email: string }) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );

    return { accessToken, refreshToken };
  }

  public static async logAudit(userId: string, action: string, module: string, details?: any, ip?: string, ua?: string) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          module,
          details: details ? JSON.stringify(details) : null,
          ipAddress: ip,
          userAgent: ua,
        },
      });
    } catch (error) {
      console.error('💥 Failed to log audit:', error);
    }
  }
}
export default AuthService;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User.ts';

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'staffsync_dev_jwt_secret_key_super_secure_2026';

/**
 * Middleware: Verify JWT Bearer token and populate req.user
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
      return;
    }
    res.status(403).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
    return;
  }
};

/**
 * Middleware: Role-based access control (RBAC)
 * @param allowedRoles Array of permitted roles: 'hr', 'manager', 'employee'
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this endpoint. Required role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Helper: Generate JWT token for an authenticated user
 */
export const generateToken = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
}): string => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

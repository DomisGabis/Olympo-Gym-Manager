import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: ('CLIENT' | 'TRAINER' | 'RECEPTIONIST' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Brak uprawnień. Dostęp zabroniony dla Twojej roli.'
      });
    }

    next(); // Użytkownik ma odpowiednią rolę, puszczamy żądanie dalej
  };
};
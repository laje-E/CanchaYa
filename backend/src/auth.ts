import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export type AuthUser = { id: number; name: string; email: string; role: "USER" | "ADMIN" };
declare global { namespace Express { interface Request { user?: AuthUser } } }
const secret = () => process.env.JWT_SECRET || "solo-desarrollo-cambiar-este-secreto";
export function signToken(user: AuthUser) { return jwt.sign(user, secret(), { expiresIn: "7d" }); }
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Iniciá sesión para continuar." });
  try { req.user = jwt.verify(token, secret()) as AuthUser; next(); }
  catch { return res.status(401).json({ error: "La sesión venció. Volvé a ingresar." }); }
}
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Se requiere permiso de administrador." });
  next();
}

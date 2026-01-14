/**
 * 🛡️ VETRIC - Middleware de Autenticação e Autorização
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { UserRole } from '../models/Usuario';

// Estender Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        nome: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware: Verificar se está autenticado
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    // Formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
      });
    }

    const token = parts[1];

    // Verificar token
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
    }

    // Adicionar usuário ao request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar autenticação',
    });
  }
}

/**
 * Middleware: Verificar se tem uma das roles permitidas
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso',
      });
    }

    next();
  };
}

/**
 * Middleware: Apenas ADMIN
 */
export const adminOnly = authorize('ADMIN');

/**
 * Middleware: ADMIN ou CLIENTE
 */
export const authenticated = authorize('ADMIN', 'CLIENTE');


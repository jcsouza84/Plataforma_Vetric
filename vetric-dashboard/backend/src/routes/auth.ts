/**
 * 🔐 VETRIC - Rotas de Autenticação
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/AuthService';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * Login de usuário
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validar input
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array(),
        });
      }

      const { email, senha } = req.body;

      // Tentar login
      const result = await authService.login(email, senha);

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.json(result);
    } catch (error: any) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao realizar login',
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Obter dados do usuário autenticado
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    // req.user já foi preenchido pelo middleware authenticate
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    const usuario = await authService.getCurrentUser(token);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    return res.json({
      success: true,
      data: usuario,
    });
  } catch (error: any) {
    console.error('Erro ao obter usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter dados do usuário',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (front-end deve remover o token)
 */
router.post('/logout', authenticate, (req: Request, res: Response) => {
  // Logout é feito no frontend (remover token)
  // Aqui só confirmamos
  return res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
});

export default router;


/**
 * 🔧 VETRIC - Rotas: Informações do Sistema
 */

import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';

const router = Router();

/**
 * GET /api/system/info
 * Retorna informações do sistema (branch git, versão, etc)
 */
router.get('/info', async (req: Request, res: Response) => {
  try {
    let gitBranch = 'unknown';
    
    try {
      // Tentar pegar a branch do git
      gitBranch = execSync('git branch --show-current', { 
        encoding: 'utf-8',
        cwd: process.cwd()
      }).trim();
    } catch (error) {
      // Se falhar, tentar da variável de ambiente
      gitBranch = process.env.GIT_BRANCH || 'main';
    }

    res.json({
      success: true,
      data: {
        gitBranch,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

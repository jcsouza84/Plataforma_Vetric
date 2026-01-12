/**
 * 🔐 VETRIC - Serviço de Autenticação
 * Gerencia login, JWT e autorizações
 */

import jwt from 'jsonwebtoken';
import { Usuario, UserRole } from '../models/Usuario';

// Configuração JWT
const JWT_SECRET = process.env.JWT_SECRET || 'vetric-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Interface do Payload JWT
export interface JWTPayload {
  userId: string;
  email: string;
  nome: string;
  role: UserRole;
}

// Interface da resposta de login
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  usuario?: {
    id: string;
    email: string;
    nome: string;
    role: UserRole;
  };
}

export class AuthService {
  /**
   * Login - Autentica usuário e retorna JWT
   */
  async login(email: string, senha: string): Promise<LoginResponse> {
    try {
      // Buscar usuário por email
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        console.warn(`Tentativa de login falhou: usuário ${email} não encontrado`);
        return {
          success: false,
          message: 'Email ou senha inválidos',
        };
      }

      // Verificar se usuário está ativo
      if (!usuario.ativo) {
        console.warn(`Tentativa de login: usuário ${email} está inativo`);
        return {
          success: false,
          message: 'Usuário inativo. Entre em contato com o administrador.',
        };
      }

      // Verificar senha
      const senhaValida = await usuario.verificarSenha(senha);

      if (!senhaValida) {
        console.warn(`Tentativa de login falhou: senha incorreta para ${email}`);
        return {
          success: false,
          message: 'Email ou senha inválidos',
        };
      }

      // Atualizar último acesso
      await usuario.update({ ultimo_acesso: new Date() });

      // Gerar JWT
      const payload: JWTPayload = {
        userId: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
      };

      const token = jwt.sign(
        payload, 
        JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      console.log(`✅ Login bem-sucedido: ${usuario.email} (${usuario.role})`);

      return {
        success: true,
        message: 'Login realizado com sucesso',
        token,
        usuario: usuario.toSafeObject(),
      };
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      return {
        success: false,
        message: 'Erro ao realizar login. Tente novamente.',
      };
    }
  }

  /**
   * Verificar e decodificar JWT
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as JWTPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.warn('⚠️  Token JWT expirado');
      } else if (error.name === 'JsonWebTokenError') {
        console.warn('⚠️  Token JWT inválido');
      }
      return null;
    }
  }

  /**
   * Obter dados do usuário atual (a partir do token)
   */
  async getCurrentUser(token: string): Promise<any> {
    try {
      const decoded = this.verifyToken(token);

      if (!decoded) {
        return null;
      }

      const usuario = await Usuario.findByPk(decoded.userId);

      if (!usuario || !usuario.ativo) {
        return null;
      }

      return usuario.toSafeObject();
    } catch (error: any) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Criar usuário (apenas para seeds/admin)
   */
  async createUser(
    email: string,
    senha: string,
    nome: string,
    role: UserRole
  ): Promise<Usuario | null> {
    try {
      // Verificar se já existe
      const existente = await Usuario.findOne({ where: { email } });

      if (existente) {
        console.warn(`⚠️  Tentativa de criar usuário duplicado: ${email}`);
        return null;
      }

      // Hash da senha
      const senha_hash = await Usuario.hashSenha(senha);

      // Criar usuário
      const usuario = await Usuario.create({
        email,
        senha_hash,
        nome,
        role,
        ativo: true,
      });

      console.log(`✅ Usuário criado: ${email} (${role})`);

      return usuario;
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);
      return null;
    }
  }
}

export const authService = new AuthService();


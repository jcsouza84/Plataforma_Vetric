/**
 * 👤 VETRIC - Model de Usuário
 * Gerencia autenticação e autorização
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';

// Tipos de role
export type UserRole = 'ADMIN' | 'CLIENTE';

// Interface do Usuário
export interface UsuarioAttributes {
  id: string;
  email: string;
  senha_hash: string;
  nome: string;
  role: UserRole;
  ativo: boolean;
  ultimo_acesso?: Date;
  criado_em: Date;
  atualizado_em: Date;
}

// Campos opcionais na criação
interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'ativo' | 'ultimo_acesso' | 'criado_em' | 'atualizado_em'> {}

// Model
export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: string;
  public email!: string;
  public senha_hash!: string;
  public nome!: string;
  public role!: UserRole;
  public ativo!: boolean;
  public ultimo_acesso?: Date;
  public readonly criado_em!: Date;
  public readonly atualizado_em!: Date;

  /**
   * Verificar senha
   */
  public async verificarSenha(senha: string): Promise<boolean> {
    return bcrypt.compare(senha, this.senha_hash);
  }

  /**
   * Hash de senha (método estático)
   */
  public static async hashSenha(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(senha, salt);
  }

  /**
   * Retornar dados seguros (sem senha)
   */
  public toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      nome: this.nome,
      role: this.role,
      ativo: this.ativo,
      ultimo_acesso: this.ultimo_acesso,
    };
  }
}

// Definir Schema
Usuario.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'CLIENTE'),
      allowNull: false,
      defaultValue: 'CLIENTE',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    ultimo_acesso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'criado_em',
    },
    atualizado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'atualizado_em',
    },
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
  }
);

export default Usuario;


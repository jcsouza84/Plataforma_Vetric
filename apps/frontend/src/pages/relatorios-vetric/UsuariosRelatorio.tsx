/**
 * 👥 VETRIC Reports - Usuários do Empreendimento
 * Gerenciamento de usuários e TAGs RFID
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UsuarioRelatorio {
  id: string;
  nome: string;
  unidade: string;
  torre: string;
  telefone: string | null;
  tags: string[];
}

export default function UsuariosRelatorio() {
  const { empreendimentoId } = useParams<{ empreendimentoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [usuarios, setUsuarios] = useState<UsuarioRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioRelatorio | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    unidade: '',
    torre: '',
    telefone: '',
    tags: '',
  });

  useEffect(() => {
    fetchUsuarios();
  }, [empreendimentoId]);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('@vetric:token');
      const response = await fetch(
        `http://localhost:3001/api/vetric-reports/empreendimentos/${empreendimentoId}/usuarios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (usuario?: UsuarioRelatorio) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nome: usuario.nome,
        unidade: usuario.unidade,
        torre: usuario.torre,
        telefone: usuario.telefone || '',
        tags: usuario.tags.join(', '),
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nome: '',
        unidade: '',
        torre: '',
        telefone: '',
        tags: '',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('@vetric:token');
      const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter((t) => t);

      const payload = {
        nome: formData.nome,
        unidade: formData.unidade,
        torre: formData.torre,
        telefone: formData.telefone || null,
        tags: tagsArray,
      };

      const url = editingUsuario
        ? `http://localhost:3001/api/vetric-reports/usuarios/${editingUsuario.id}`
        : `http://localhost:3001/api/vetric-reports/empreendimentos/${empreendimentoId}/usuarios`;

      const method = editingUsuario ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: `Usuário ${editingUsuario ? 'atualizado' : 'criado'} com sucesso`,
        });
        setModalOpen(false);
        fetchUsuarios();
      } else {
        throw new Error('Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o usuário',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const token = localStorage.getItem('@vetric:token');
      const response = await fetch(`http://localhost:3001/api/vetric-reports/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Usuário excluído com sucesso',
        });
        fetchUsuarios();
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/vetric-reports/${empreendimentoId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600">Gerencie os usuários e TAGs RFID</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-orange-500 hover:bg-orange-600">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Torre</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>TAGs</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum usuário cadastrado
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.unidade}</TableCell>
                  <TableCell>{usuario.torre}</TableCell>
                  <TableCell>{usuario.telefone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {usuario.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(usuario)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(usuario.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Criação/Edição */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              Preencha as informações do usuário e suas TAGs RFID
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade *</Label>
                <Input
                  id="unidade"
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="torre">Torre *</Label>
                <Input
                  id="torre"
                  value={formData.torre}
                  onChange={(e) => setFormData({ ...formData, torre: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">TAGs RFID *</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="TAG1, TAG2, TAG3"
                required
              />
              <p className="text-xs text-gray-500">Separe as TAGs por vírgula</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              {editingUsuario ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


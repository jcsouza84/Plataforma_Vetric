/**
 * 👥 VETRIC - Página de Usuários (Moradores)
 * Cliente: Visualização (read-only)
 * Admin: CRUD completo
 */

import { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, Phone, Bell, BellOff } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMoradores, useDeleteMorador } from '@/hooks/useVetricData';
import { EditarMoradorModal } from '@/components/modals/EditarMoradorModal';
import { CriarMoradorModal } from '@/components/modals/CriarMoradorModal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Usuarios() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { data: moradores, isLoading } = useMoradores();
  const deleteMutation = useDeleteMorador();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMorador, setSelectedMorador] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filtrar moradores
  const filteredMoradores = moradores?.filter((m: any) => {
    const search = searchTerm.toLowerCase();
    return (
      m.nome.toLowerCase().includes(search) ||
      m.apartamento.toLowerCase().includes(search) ||
      m.tag_rfid.toLowerCase().includes(search)
    );
  });

  // Estatísticas
  const stats = {
    total: moradores?.length || 0,
    comTelefone: moradores?.filter((m: any) => m.telefone).length || 0,
    notificacoesAtivas: moradores?.filter((m: any) => m.notificacoes_ativas).length || 0,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Moradores do Condomínio
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gran Marine · {stats.total} morador(es) cadastrado(s)
            </p>
          </div>

          {/* Botão Adicionar (Admin only) */}
          {isAdmin && (
            <Button 
              className="gap-2"
              onClick={() => setCreateModalOpen(true)}
            >
              <UserPlus size={18} />
              Novo Morador
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total de Moradores</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Com Telefone</p>
          <p className="text-2xl font-bold mt-1">{stats.comTelefone}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Notificações Ativas</p>
          <p className="text-2xl font-bold mt-1">{stats.notificacoesAtivas}</p>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, apartamento ou TAG..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Apartamento</TableHead>
                <TableHead>Tag RFID</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Notificações</TableHead>
                {isAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMoradores && filteredMoradores.length > 0 ? (
                filteredMoradores.map((morador: any) => (
                  <TableRow key={morador.id}>
                    <TableCell className="font-medium">{morador.nome}</TableCell>
                    <TableCell>{morador.apartamento}</TableCell>
                    <TableCell className="font-mono text-sm">{morador.tag_rfid.substring(0, 12)}...</TableCell>
                    <TableCell>
                      {morador.telefone ? (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-muted-foreground" />
                          <span className="text-sm">{morador.telefone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {morador.notificacoes_ativas ? (
                        <Badge variant="default" className="gap-1">
                          <Bell size={12} />
                          Ativas
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <BellOff size={12} />
                          Desativadas
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedMorador(morador);
                              setEditModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={async () => {
                              if (confirm(`Tem certeza que deseja deletar ${morador.nome}?`)) {
                                try {
                                  await deleteMutation.mutateAsync(morador.id);
                                  toast({
                                    title: 'Sucesso!',
                                    description: 'Morador deletado com sucesso',
                                  });
                                } catch (error: any) {
                                  toast({
                                    title: 'Erro ao deletar',
                                    description: error.message,
                                    variant: 'destructive',
                                  });
                                }
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Nenhum morador encontrado' : 'Nenhum morador cadastrado'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {/* Modal de Criação */}
      <CriarMoradorModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Modal de Edição */}
      {selectedMorador && (
        <EditarMoradorModal
          morador={selectedMorador}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedMorador(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

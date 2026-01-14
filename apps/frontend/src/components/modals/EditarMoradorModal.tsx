/**
 * 👤 VETRIC - Modal de Edição de Morador
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUpdateMorador } from '@/hooks/useVetricData';
import { useToast } from '@/hooks/use-toast';

interface EditarMoradorModalProps {
  morador: any;
  open: boolean;
  onClose: () => void;
}

export function EditarMoradorModal({ morador, open, onClose }: EditarMoradorModalProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateMorador();

  const [formData, setFormData] = useState({
    nome: '',
    apartamento: '',
    telefone: '',
    tag_rfid: '',
    notificacoes_ativas: false,
  });

  useEffect(() => {
    if (morador) {
      setFormData({
        nome: morador.nome || '',
        apartamento: morador.apartamento || '',
        telefone: morador.telefone || '',
        tag_rfid: morador.tag_rfid || '',
        notificacoes_ativas: morador.notificacoes_ativas || false,
      });
    }
  }, [morador]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: morador.id,
        updates: {
          ...formData,
          telefone: formData.telefone || null,
        },
      });

      toast({
        title: 'Sucesso!',
        description: 'Morador atualizado com sucesso',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Morador</DialogTitle>
          <DialogDescription>
            Atualize as informações do morador abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              disabled={updateMutation.isPending}
            />
          </div>

          {/* Apartamento */}
          <div className="space-y-2">
            <Label htmlFor="apartamento">
              Apartamento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apartamento"
              value={formData.apartamento}
              onChange={(e) => setFormData({ ...formData, apartamento: e.target.value })}
              required
              disabled={updateMutation.isPending}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">
              Telefone (WhatsApp)
            </Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="+5582999999999"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Formato: +5582999999999 (obrigatório para notificações)
            </p>
          </div>

          {/* Tag RFID */}
          <div className="space-y-2">
            <Label htmlFor="tag_rfid">
              Tag RFID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tag_rfid"
              value={formData.tag_rfid}
              onChange={(e) => setFormData({ ...formData, tag_rfid: e.target.value })}
              required
              disabled={updateMutation.isPending}
              className="font-mono"
            />
          </div>

          {/* Notificações Ativas */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="notificacoes">Notificações WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Receber alertas de carregamento por WhatsApp
              </p>
            </div>
            <Switch
              id="notificacoes"
              checked={formData.notificacoes_ativas}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notificacoes_ativas: checked })
              }
              disabled={updateMutation.isPending || !formData.telefone}
            />
          </div>

          {!formData.telefone && formData.notificacoes_ativas && (
            <p className="text-sm text-orange-600">
              ⚠️ Adicione um telefone para ativar as notificações
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


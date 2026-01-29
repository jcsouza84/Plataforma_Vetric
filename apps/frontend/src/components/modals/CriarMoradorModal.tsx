/**
 * 👤 VETRIC - Modal de Criação de Morador
 */

import { useState } from 'react';
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
import { useCreateMorador } from '@/hooks/useVetricData';
import { useToast } from '@/hooks/use-toast';

interface CriarMoradorModalProps {
  open: boolean;
  onClose: () => void;
}

export function CriarMoradorModal({ open, onClose }: CriarMoradorModalProps) {
  const { toast } = useToast();
  const createMutation = useCreateMorador();

  const [formData, setFormData] = useState({
    nome: '',
    apartamento: '',
    telefone: '',
    tag_rfid: '',
    notificacoes_ativas: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        ...formData,
        telefone: formData.telefone || null,
      });

      toast({
        title: 'Sucesso!',
        description: 'Morador cadastrado com sucesso',
      });

      // Limpar formulário
      setFormData({
        nome: '',
        apartamento: '',
        telefone: '',
        tag_rfid: '',
        notificacoes_ativas: false,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setFormData({
      nome: '',
      apartamento: '',
      telefone: '',
      tag_rfid: '',
      notificacoes_ativas: false,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Morador</DialogTitle>
          <DialogDescription>
            Cadastre um novo morador no condomínio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              placeholder="Ex: João Silva Santos"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              disabled={createMutation.isPending}
            />
          </div>

          {/* Apartamento */}
          <div className="space-y-2">
            <Label htmlFor="apartamento">
              Apartamento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apartamento"
              placeholder="Ex: 1001-A"
              value={formData.apartamento}
              onChange={(e) => setFormData({ ...formData, apartamento: e.target.value })}
              required
              disabled={createMutation.isPending}
            />
          </div>

          {/* Tag RFID */}
          <div className="space-y-2">
            <Label htmlFor="tag_rfid">
              Tag RFID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tag_rfid"
              placeholder="Ex: 8D7A223B"
              value={formData.tag_rfid}
              onChange={(e) => setFormData({ ...formData, tag_rfid: e.target.value.toUpperCase() })}
              required
              disabled={createMutation.isPending}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Cole a tag RFID exatamente como aparece nos logs do sistema
            </p>
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
              disabled={createMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Formato: +55 + DDD + número (obrigatório para notificações)
            </p>
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
              disabled={createMutation.isPending || !formData.telefone}
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
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Morador'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


/**
 * 📧 Hook para gerenciar Mensagens de Notificações Inteligentes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export interface MensagemNotificacao {
  id: number;
  tipo: string;
  titulo: string;
  corpo: string;
  tempo_minutos: number;
  power_threshold_w: number | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

// Buscar todas as mensagens
export function useMensagensNotificacoes() {
  return useQuery({
    queryKey: ['mensagens-notificacoes'],
    queryFn: async () => {
      const { data } = await api.get('/api/mensagens-notificacoes');
      return data.data as MensagemNotificacao[];
    },
  });
}

// Atualizar mensagem
export function useUpdateMensagemNotificacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tipo, updates }: { tipo: string; updates: Partial<MensagemNotificacao> }) => {
      const { data } = await api.put(`/api/mensagens-notificacoes/${tipo}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens-notificacoes'] });
    },
  });
}

// Toggle ativo/inativo
export function useToggleMensagemNotificacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tipo: string) => {
      const { data } = await api.patch(`/api/mensagens-notificacoes/${tipo}/toggle`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens-notificacoes'] });
    },
  });
}


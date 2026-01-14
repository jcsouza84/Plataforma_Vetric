/**
 * 🪝 VETRIC - Custom Hooks
 * Hooks para consumir dados do backend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vetricAPI } from '../services/api';
import type { CreateMoradorDTO, UpdateMoradorDTO, UpdateTemplateDTO } from '../types/backend';

// ==================== DASHBOARD ====================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => vetricAPI.getDashboardStats(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

export function useChargers() {
  return useQuery({
    queryKey: ['chargers'],
    queryFn: () => vetricAPI.getChargers(),
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });
}

export function useCharger(uuid: string | undefined) {
  return useQuery({
    queryKey: ['charger', uuid],
    queryFn: () => vetricAPI.getChargerByUuid(uuid!),
    enabled: !!uuid,
    refetchInterval: 5000,
  });
}

// ==================== MORADORES ====================

export function useMoradores() {
  return useQuery({
    queryKey: ['moradores'],
    queryFn: () => vetricAPI.getMoradores(),
  });
}

export function useMorador(id: number | undefined) {
  return useQuery({
    queryKey: ['morador', id],
    queryFn: () => vetricAPI.getMoradorById(id!),
    enabled: !!id,
  });
}

export function useMoradorByTag(tag: string | undefined) {
  return useQuery({
    queryKey: ['morador', 'tag', tag],
    queryFn: () => vetricAPI.getMoradorByTag(tag!),
    enabled: !!tag,
  });
}

export function useCreateMorador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (morador: CreateMoradorDTO) => vetricAPI.createMorador(morador),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
    },
  });
}

export function useUpdateMorador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateMoradorDTO }) =>
      vetricAPI.updateMorador(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
      queryClient.invalidateQueries({ queryKey: ['morador', variables.id] });
    },
  });
}

export function useDeleteMorador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vetricAPI.deleteMorador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
    },
  });
}

// ==================== CARREGAMENTOS ====================

export function useCarregamentos(limit: number = 100) {
  return useQuery({
    queryKey: ['carregamentos', limit],
    queryFn: () => vetricAPI.getCarregamentos(limit),
  });
}

export function useCarregamentosAtivos() {
  return useQuery({
    queryKey: ['carregamentos', 'ativos'],
    queryFn: () => vetricAPI.getCarregamentosAtivos(),
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
}

export function useCarregamentosByMorador(moradorId: number | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['carregamentos', 'morador', moradorId, limit],
    queryFn: () => vetricAPI.getCarregamentosByMorador(moradorId!, limit),
    enabled: !!moradorId,
  });
}

export function useCarregamentosStatsToday() {
  return useQuery({
    queryKey: ['carregamentos', 'stats', 'today'],
    queryFn: () => vetricAPI.getCarregamentosStatsToday(),
    refetchInterval: 60000, // Atualiza a cada minuto
  });
}

export function useCarregamentosStatsByPeriod(start: string, end: string) {
  return useQuery({
    queryKey: ['carregamentos', 'stats', 'period', start, end],
    queryFn: () => vetricAPI.getCarregamentosStatsByPeriod(start, end),
    enabled: !!start && !!end,
  });
}

// ==================== TEMPLATES ====================

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => vetricAPI.getTemplates(),
  });
}

export function useTemplate(tipo: string | undefined) {
  return useQuery({
    queryKey: ['template', tipo],
    queryFn: () => vetricAPI.getTemplateByTipo(tipo!),
    enabled: !!tipo,
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tipo, updates }: { tipo: string; updates: UpdateTemplateDTO }) =>
      vetricAPI.updateTemplate(tipo, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.tipo] });
    },
  });
}

// ==================== RELATÓRIOS ====================

export function useRelatorios() {
  return useQuery({
    queryKey: ['relatorios'],
    queryFn: () => vetricAPI.getRelatorios(),
  });
}

export function useUploadRelatorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => vetricAPI.uploadRelatorio(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatorios'] });
    },
  });
}

export function useDeleteRelatorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vetricAPI.deleteRelatorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatorios'] });
    },
  });
}

// ==================== CONFIGURAÇÕES ====================

export function useConfiguracoes() {
  return useQuery({
    queryKey: ['configuracoes'],
    queryFn: () => vetricAPI.getConfiguracoes(),
  });
}

export function useConfiguracao(chave: string) {
  return useQuery({
    queryKey: ['configuracao', chave],
    queryFn: () => vetricAPI.getConfiguracao(chave),
    enabled: !!chave,
  });
}

export function useUpdateConfiguracao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chave, valor }: { chave: string; valor: string }) =>
      vetricAPI.updateConfiguracao(chave, valor),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      queryClient.invalidateQueries({ queryKey: ['configuracao', variables.chave] });
    },
  });
}

export function useUpdateConfiguracoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configs: Array<{ chave: string; valor: string }>) =>
      vetricAPI.updateConfiguracoes(configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
    },
  });
}

// ==================== HEALTH CHECK ====================

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => vetricAPI.healthCheck(),
    refetchInterval: 30000,
    retry: 1,
  });
}


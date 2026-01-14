/**
 * 📊 VETRIC Dashboard - Visual do GitHub + Dados Reais da API
 */

import { Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ChargerCard, convertToChargerCardData, mapCVEStatusToGitHub } from '@/components/ChargerCard';
import { StatusSummary } from '@/components/StatusSummary';
import { useChargers, useCarregamentosAtivos } from '@/hooks/useVetricData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: chargers, isLoading } = useChargers();
  const { data: carregamentosAtivos } = useCarregamentosAtivos();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Calcular contadores de status
  const statusCounts = useMemo(() => {
    if (!chargers) {
      return { total: 0, inUse: 0, waiting: 0, idle: 0, failure: 0, offline: 0 };
    }

    return {
      total: chargers.length,
      inUse: chargers.filter((c: any) => c.statusConector === 'Charging').length,
      waiting: chargers.filter((c: any) => ['Occupied', 'Preparing', 'Finishing'].includes(c.statusConector)).length,
      idle: chargers.filter((c: any) => ['SuspendedEV', 'SuspendedEVSE'].includes(c.statusConector)).length,
      failure: chargers.filter((c: any) => c.statusConector === 'Faulted').length,
      offline: chargers.filter((c: any) => c.statusConector === 'Unavailable').length,
    };
  }, [chargers]);

  // Converter chargers da API para formato do componente visual
  const chargerCards = useMemo(() => {
    if (!chargers) return [];
    
    return chargers.map((charger: any) => {
      // Morador agora vem direto do endpoint /api/dashboard/chargers
      const morador = charger.morador ? {
        nome: charger.morador.nome,
        apartamento: charger.morador.apartamento
      } : undefined;

      return convertToChargerCardData(charger, morador);
    });
  }, [chargers]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Central de Monitoramento
            </h1>
            <p className="mt-1 text-muted-foreground">
              Status operacional dos carregadores em tempo real
            </p>
          </div>
          
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-700">
              Atualização automática ativa
            </span>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-muted-foreground">
          Gran Marine • Última atualização: {formatTime(new Date())}
        </p>
      </div>

      {/* Status Summary */}
      <div className="mb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <StatusSummary counts={statusCounts} />
        )}
      </div>

      {/* Charger Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      ) : chargerCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chargerCards.map((charger) => (
            <ChargerCard key={charger.id} charger={charger} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            Nenhum carregador encontrado
          </h3>
          <p className="text-muted-foreground mt-1">
            Verifique a conexão com a API CVE-Pro
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Monitoramento em Tempo Real
            </p>
            <p className="text-sm text-muted-foreground">
              Os status são atualizados automaticamente conforme os carregadores reportam suas atividades. 
              Para ver histórico de consumo e relatórios mensais, acesse a seção de Relatórios.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * 🔌 ChargerCard - Visual do GitHub + Dados Reais da API CVE-Pro
 */

import { useState, useEffect } from 'react';
import { Car, Plug, AlertTriangle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Charger } from '@/types/backend';

export type ChargerStatus = 'available' | 'in_use' | 'idle' | 'waiting' | 'failure' | 'offline';

export interface ChargerCardData {
  id: string;
  name: string;
  location?: string;
  status: ChargerStatus;
  timeElapsed?: string;
  resident?: {
    name: string;
    unit: string;
  };
  since?: string;
}

interface ChargerCardProps {
  charger: ChargerCardData;
}

const statusConfig: Record<ChargerStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  dotColor: string;
}> = {
  available: {
    label: 'DISPONÍVEL',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    dotColor: 'bg-green-500',
  },
  in_use: {
    label: 'EM USO',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    dotColor: 'bg-emerald-500',
  },
  idle: {
    label: 'OCIOSO',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconBg: 'bg-gray-100',
    dotColor: 'bg-gray-400',
  },
  waiting: {
    label: 'AGUARDANDO',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    dotColor: 'bg-blue-500',
  },
  failure: {
    label: 'COM FALHA',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
    dotColor: 'bg-red-500',
  },
  offline: {
    label: 'OFFLINE',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    iconBg: 'bg-gray-200',
    dotColor: 'bg-gray-700',
  },
};

const ChargerIcon = ({ status }: { status: ChargerStatus }) => {
  const iconClass = cn(
    "h-12 w-12 transition-all duration-300",
    status === 'available' && "text-green-600",
    status === 'in_use' && "text-emerald-600 animate-pulse",
    status === 'idle' && "text-gray-400",
    status === 'waiting' && "text-blue-600",
    status === 'failure' && "text-red-600",
    status === 'offline' && "text-gray-600"
  );

  if (status === 'failure') {
    return <AlertTriangle className={iconClass} />;
  }
  
  if (status === 'offline') {
    return <WifiOff className={iconClass} />;
  }

  if (status === 'in_use' || status === 'waiting') {
    return (
      <div className="relative">
        <Car className={iconClass} />
        <Plug className={cn(
          "h-5 w-5 absolute -bottom-1 -right-1",
          status === 'in_use' ? "text-emerald-500" : "text-blue-500"
        )} />
      </div>
    );
  }

  return <Plug className={iconClass} />;
};

export function ChargerCard({ charger }: ChargerCardProps) {
  const config = statusConfig[charger.status];
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation on status change
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [charger.status]);

  const getTimeLabel = () => {
    switch (charger.status) {
      case 'available':
        return `Disponível há ${charger.timeElapsed}`;
      case 'in_use':
        return `Em carga há ${charger.timeElapsed}`;
      case 'idle':
        return `Ocioso há ${charger.timeElapsed}`;
      case 'waiting':
        return `Aguardando há ${charger.timeElapsed}`;
      case 'failure':
      case 'offline':
        return `Desde ${charger.since}`;
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg",
        config.bgColor,
        config.borderColor,
        isAnimating && "scale-[1.02]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            {charger.name}
          </h3>
          {charger.location && (
            <p className="text-sm text-muted-foreground">
              {charger.location}
            </p>
          )}
        </div>
        
        {/* Status Dot */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "h-3 w-3 rounded-full animate-pulse",
            config.dotColor
          )} />
        </div>
      </div>

      {/* Icon Central */}
      <div className={cn(
        "flex items-center justify-center py-6 rounded-lg mb-4",
        config.iconBg
      )}>
        <ChargerIcon status={charger.status} />
      </div>

      {/* Status Label */}
      <div className="text-center mb-3">
        <span className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold",
          config.bgColor,
          config.color,
          "border",
          config.borderColor
        )}>
          <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
          {config.label}
        </span>
      </div>

      {/* Time Info */}
      <p className="text-center text-sm text-muted-foreground mb-4 font-mono">
        {getTimeLabel()}
      </p>

      {/* Resident Info */}
      <div className={cn(
        "rounded-lg p-3 text-center",
        charger.resident ? "bg-white/60" : "bg-transparent"
      )}>
        {charger.resident ? (
          <>
            <p className="font-medium text-foreground">
              {charger.resident.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Unidade {charger.resident.unit}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Morador: —
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 🔄 Mapeia status da API CVE-Pro para status visual do Frontend
 * 
 * Available      → DISPONÍVEL (livre para uso, sem carro)
 * Charging       → EM USO (carregando ativamente)
 * SuspendedEV    → OCIOSO (carro conectado, bateria cheia)
 * SuspendedEVSE  → OCIOSO (pausado pelo carregador)
 * Occupied       → AGUARDANDO (esperando autorização)
 * Preparing      → AGUARDANDO (preparando carga)
 * Finishing      → AGUARDANDO (finalizando carga)
 * Faulted        → COM FALHA (erro técnico)
 * Unavailable    → OFFLINE (sem comunicação)
 */
export function mapCVEStatusToGitHub(cveStatus: string): ChargerStatus {
  switch (cveStatus) {
    // 🟢 DISPONÍVEL - Livre para uso (sem carro)
    case 'Available':
      return 'available';
    
    // 🟢 EM USO - Carregando ativamente
    case 'Charging':
      return 'in_use';
    
    // 🟡 OCIOSO - Carro conectado mas não carregando
    case 'SuspendedEV':      // Pausado pelo veículo (bateria cheia)
    case 'SuspendedEVSE':    // Pausado pelo carregador
      return 'idle';
    
    // 🔵 AGUARDANDO - Preparando ou esperando
    case 'Occupied':         // Ocupado esperando autorização
    case 'Preparing':        // Preparando para carregar
    case 'Finishing':        // Finalizando carregamento
      return 'waiting';
    
    // 🔴 COM FALHA - Erro técnico
    case 'Faulted':
      return 'failure';
    
    // ⚫ OFFLINE - Sem comunicação
    case 'Unavailable':
    default:
      return 'offline';
  }
}

/**
 * 🔄 Converte Charger da API para ChargerCardData do componente visual
 */
export function convertToChargerCardData(apiCharger: any, morador?: { nome: string; apartamento: string }): ChargerCardData {
  const status = mapCVEStatusToGitHub(apiCharger.statusConector);
  
  let timeElapsed: string;
  let since: string;
  
  // Se tiver carregamento ativo, usar duração real do carregamento
  if (apiCharger.carregamentoAtivo && (status === 'in_use' || status === 'idle' || status === 'waiting')) {
    const duracaoMinutos = apiCharger.carregamentoAtivo.duracaoMinutos;
    const hours = Math.floor(duracaoMinutos / 60);
    const mins = Math.floor(duracaoMinutos % 60);
    const secs = Math.floor(((duracaoMinutos % 1) * 60));
    timeElapsed = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    since = new Date(apiCharger.carregamentoAtivo.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else {
    // Usar tempo desde último batimento (para disponível ou offline)
    const now = Date.now();
    const lastBeat = new Date(apiCharger.ultimoBatimento).getTime();
    const diffMs = now - lastBeat;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const secs = Math.floor((diffMs % 60000) / 1000);
    timeElapsed = `${diffHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    since = new Date(apiCharger.ultimoBatimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return {
    id: apiCharger.uuid,
    name: apiCharger.nome,
    location: apiCharger.chargeBoxId,
    status,
    timeElapsed: ['available', 'in_use', 'idle', 'waiting'].includes(status) ? timeElapsed : undefined,
    since: ['failure', 'offline'].includes(status) ? since : undefined,
    resident: morador ? { name: morador.nome, unit: morador.apartamento } : undefined,
  };
}

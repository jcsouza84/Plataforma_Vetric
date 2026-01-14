import { useState, useEffect, useCallback } from 'react';
import { ChargerData, ChargerStatus } from '@/components/ChargerCard';
import { useToast } from '@/hooks/use-toast';

const initialChargers: ChargerData[] = [
  {
    id: '1',
    name: 'Carregador 01',
    location: 'Subsolo • Vaga 12',
    status: 'in_use',
    timeElapsed: '00:42:15',
    resident: { name: 'Marcella Pontes', unit: '302' },
  },
  {
    id: '2',
    name: 'Carregador 02',
    location: 'Subsolo • Vaga 14',
    status: 'waiting',
    timeElapsed: '00:08:12',
    resident: { name: 'Ana Silva', unit: '105' },
  },
  {
    id: '3',
    name: 'Carregador 03',
    location: 'Subsolo • Vaga 18',
    status: 'idle',
    timeElapsed: '12:10:05',
  },
  {
    id: '4',
    name: 'Carregador 04',
    location: 'Térreo • Vaga 02',
    status: 'failure',
    since: '14:32',
  },
  {
    id: '5',
    name: 'Carregador 05',
    location: 'Térreo • Vaga 05',
    status: 'in_use',
    timeElapsed: '01:18:40',
    resident: { name: 'Carlos Lima', unit: '201' },
  },
  {
    id: '6',
    name: 'Carregador 06',
    location: 'Térreo • Vaga 08',
    status: 'offline',
    since: '09:15',
  },
];

// Helper to increment time string
const incrementTime = (time: string): string => {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    let [h, m, s] = parts;
    s += 1;
    if (s >= 60) { s = 0; m += 1; }
    if (m >= 60) { m = 0; h += 1; }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return time;
};

export function useChargerSimulation() {
  const [chargers, setChargers] = useState<ChargerData[]>(initialChargers);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  // Update times every second
  useEffect(() => {
    const interval = setInterval(() => {
      setChargers(prev => prev.map(charger => {
        if (charger.timeElapsed && ['in_use', 'waiting', 'idle'].includes(charger.status)) {
          return { ...charger, timeElapsed: incrementTime(charger.timeElapsed) };
        }
        return charger;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate random status changes every 15-30 seconds
  useEffect(() => {
    const simulateChange = () => {
      const randomDelay = Math.random() * 15000 + 15000; // 15-30 seconds
      
      setTimeout(() => {
        setChargers(prev => {
          const chargerIndex = Math.floor(Math.random() * prev.length);
          const charger = prev[chargerIndex];
          
          // Don't change offline/failure status randomly (they need "fixing")
          if (charger.status === 'offline' || charger.status === 'failure') {
            return prev;
          }

          const possibleStatuses: ChargerStatus[] = ['in_use', 'waiting', 'idle'];
          const residents = [
            { name: 'Marcella Pontes', unit: '302' },
            { name: 'Ana Silva', unit: '105' },
            { name: 'Carlos Lima', unit: '201' },
            { name: 'João Santos', unit: '410' },
            { name: 'Maria Costa', unit: '308' },
          ];

          const newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
          
          if (newStatus !== charger.status) {
            const updatedCharger: ChargerData = {
              ...charger,
              status: newStatus,
              timeElapsed: '00:00:01',
              resident: newStatus === 'idle' ? undefined : residents[Math.floor(Math.random() * residents.length)],
            };

            toast({
              title: `${charger.name}`,
              description: `Status alterado para ${
                newStatus === 'in_use' ? 'Em Uso' :
                newStatus === 'waiting' ? 'Aguardando Carga' :
                'Ocioso'
              }`,
              duration: 3000,
            });

            setLastUpdate(new Date());

            return prev.map((c, i) => i === chargerIndex ? updatedCharger : c);
          }

          return prev;
        });

        simulateChange();
      }, randomDelay);
    };

    simulateChange();
  }, [toast]);

  const getStatusCounts = useCallback(() => {
    return {
      total: chargers.length,
      inUse: chargers.filter(c => c.status === 'in_use').length,
      waiting: chargers.filter(c => c.status === 'waiting').length,
      idle: chargers.filter(c => c.status === 'idle').length,
      failure: chargers.filter(c => c.status === 'failure').length,
      offline: chargers.filter(c => c.status === 'offline').length,
    };
  }, [chargers]);

  return {
    chargers,
    lastUpdate,
    statusCounts: getStatusCounts(),
  };
}

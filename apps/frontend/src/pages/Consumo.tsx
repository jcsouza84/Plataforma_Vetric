import { useState } from 'react';
import { Trophy, Search, Calendar, Download, Medal } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Mock data
const mockConsumo = [
  { posicao: 1, unidade: '302', torre: 'A', usuario: 'Marcella Pontes', recargas: 8, consumo: 293.15, valor: 165.23 },
  { posicao: 2, unidade: '105', torre: 'A', usuario: 'Ana Silva', recargas: 6, consumo: 220.40, valor: 128.45 },
  { posicao: 3, unidade: '201', torre: 'B', usuario: 'Carlos Lima', recargas: 5, consumo: 180.20, valor: 98.12 },
  { posicao: 4, unidade: '410', torre: 'A', usuario: 'João Mendes', recargas: 5, consumo: 175.80, valor: 92.30 },
  { posicao: 5, unidade: '308', torre: 'B', usuario: 'Maria Santos', recargas: 4, consumo: 168.50, valor: 88.15 },
  { posicao: 6, unidade: '502', torre: 'A', usuario: 'Pedro Costa', recargas: 4, consumo: 150.20, valor: 78.40 },
  { posicao: 7, unidade: '115', torre: 'B', usuario: 'Julia Ferreira', recargas: 3, consumo: 120.80, valor: 62.50 },
  { posicao: 8, unidade: '203', torre: 'A', usuario: 'Rafael Oliveira', recargas: 3, consumo: 98.40, valor: 51.20 },
  { posicao: 9, unidade: '401', torre: 'B', usuario: 'Fernanda Souza', recargas: 2, consumo: 75.60, valor: 39.80 },
  { posicao: 10, unidade: '306', torre: 'A', usuario: 'Lucas Almeida', recargas: 2, consumo: 68.90, valor: 36.10 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);
};

const getMedalColor = (posicao: number) => {
  switch (posicao) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-gray-400';
    case 3:
      return 'text-amber-600';
    default:
      return 'text-muted-foreground';
  }
};

const getMedalEmoji = (posicao: number) => {
  switch (posicao) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};

export default function Consumo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('11/2025');

  const filteredConsumo = mockConsumo.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.usuario.toLowerCase().includes(search) ||
      item.unidade.toLowerCase().includes(search) ||
      item.torre?.toLowerCase().includes(search)
    );
  });

  const top5 = mockConsumo.slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Consumo por Unidade
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ranking de consumo do mês {selectedMonth}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar unidade, usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="11/2025">Novembro/2025</SelectItem>
            <SelectItem value="10/2025">Outubro/2025</SelectItem>
            <SelectItem value="09/2025">Setembro/2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top 5 Cards */}
      <div className="bg-card rounded-xl p-6 shadow-md mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">
            Top 5 Unidades
          </h2>
        </div>

        <div className="grid gap-3">
          {top5.map((item, index) => (
            <div
              key={item.unidade}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg transition-all duration-300',
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20' 
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-400/10 to-gray-400/5 border border-gray-400/20'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-600/10 to-amber-600/5 border border-amber-600/20'
                  : 'bg-muted/50'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full font-bold',
                  index < 3 ? getMedalColor(item.posicao) : 'text-muted-foreground'
                )}>
                  {getMedalEmoji(item.posicao) || (
                    <span className="text-lg">{item.posicao}º</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">
                    Unidade {item.unidade} {item.torre && `(${item.torre})`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.usuario}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-card-foreground">
                  {formatNumber(item.consumo)} kWh
                </p>
                <p className="text-sm text-primary font-medium">
                  {formatCurrency(item.valor)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Table */}
      <div className="bg-card rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Todas as Unidades
          </h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="text-center">Recargas</TableHead>
                <TableHead className="text-right">Consumo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsumo.map((item) => (
                <TableRow key={item.unidade}>
                  <TableCell>
                    <span className={cn(
                      'font-medium',
                      item.posicao <= 3 && getMedalColor(item.posicao)
                    )}>
                      {getMedalEmoji(item.posicao) || `${item.posicao}º`}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.unidade} {item.torre && `(${item.torre})`}
                  </TableCell>
                  <TableCell>{item.usuario}</TableCell>
                  <TableCell className="text-center">{item.recargas}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.consumo)} kWh
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(item.valor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredConsumo.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Nenhuma unidade encontrada
            </h3>
            <p className="text-muted-foreground mt-1">
              Tente ajustar o termo de busca
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

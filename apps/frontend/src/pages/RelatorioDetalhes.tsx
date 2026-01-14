import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  FileText,
  Zap,
  DollarSign,
  Battery,
  Clock,
  Sun,
  Moon,
  Search
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

// Mock data
const mockRelatorio = {
  id: '1',
  mesAno: '11/2025',
  empreendimento: {
    nome: 'Condomínio Salt',
  },
  resumo: {
    recargas: 45,
    consumoTotal: 1176.14,
    gastoTotal: 867.91,
    ociosidadeTotal: '242:15:00',
    consumoPonta: 456.23,
    gastoPonta: 632.48,
    consumoForaPonta: 720.91,
    gastoForaPonta: 235.43,
  },
  graficoCargasPorHora: [
    { hora: '00h', recargas: 2, consumo: 25.5 },
    { hora: '02h', recargas: 1, consumo: 12.3 },
    { hora: '04h', recargas: 0, consumo: 0 },
    { hora: '06h', recargas: 3, consumo: 38.2 },
    { hora: '08h', recargas: 5, consumo: 62.8 },
    { hora: '10h', recargas: 4, consumo: 51.4 },
    { hora: '12h', recargas: 3, consumo: 39.1 },
    { hora: '14h', recargas: 2, consumo: 26.7 },
    { hora: '16h', recargas: 4, consumo: 52.3 },
    { hora: '18h', recargas: 8, consumo: 98.6 },
    { hora: '20h', recargas: 7, consumo: 85.4 },
    { hora: '22h', recargas: 6, consumo: 72.1 },
  ],
  resumoPorUsuario: [
    { usuario: 'Marcella Pontes', unidade: '302', torre: 'A', recargas: 8, consumo: 293.15, ociosidade: '40:15:00', valor: 165.23 },
    { usuario: 'Ana Silva', unidade: '105', torre: 'A', recargas: 6, consumo: 220.40, ociosidade: '32:00:00', valor: 128.45 },
    { usuario: 'Carlos Lima', unidade: '201', torre: 'B', recargas: 5, consumo: 180.20, ociosidade: '28:30:00', valor: 98.12 },
    { usuario: 'João Mendes', unidade: '410', torre: 'A', recargas: 5, consumo: 175.80, ociosidade: '25:45:00', valor: 92.30 },
    { usuario: 'Maria Santos', unidade: '308', torre: 'B', recargas: 4, consumo: 168.50, ociosidade: '22:15:00', valor: 88.15 },
  ],
  pdfUrl: '#',
  createdAt: '2025-12-02T14:30:00Z',
};

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

export default function RelatorioDetalhes() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  const data = mockRelatorio;

  const filteredUsuarios = data.resumoPorUsuario.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.usuario.toLowerCase().includes(search) ||
      item.unidade.toLowerCase().includes(search)
    );
  });

  const mesAnoDisplay = data.mesAno.split('/').map((part, i) => {
    if (i === 0) {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return meses[parseInt(part) - 1];
    }
    return part;
  }).join('/');

  return (
    <DashboardLayout>
      {/* Back Button */}
      <Link to="/relatorios" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Relatórios
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Relatório {mesAnoDisplay}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {data.empreendimento.nome}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Enviar por Email
          </Button>
          <Button variant="vetric" className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <MetricCard
          icon={<Battery className="h-5 w-5" />}
          label="Recargas"
          value={data.resumo.recargas.toString()}
        />
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Consumo Total"
          value={`${formatNumber(data.resumo.consumoTotal)} kWh`}
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Gasto Total"
          value={formatCurrency(data.resumo.gastoTotal)}
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Ociosidade"
          value={data.resumo.ociosidadeTotal}
        />
        <MetricCard
          icon={<Sun className="h-5 w-5" />}
          label="Ponta"
          value={`${formatNumber(data.resumo.consumoPonta)} kWh`}
          comparison={formatCurrency(data.resumo.gastoPonta)}
        />
        <MetricCard
          icon={<Moon className="h-5 w-5" />}
          label="Fora Ponta"
          value={`${formatNumber(data.resumo.consumoForaPonta)} kWh`}
          comparison={formatCurrency(data.resumo.gastoForaPonta)}
        />
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          Consumo por Horário
        </h2>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.graficoCargasPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hora" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="consumo" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Consumo (kWh)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">
              Resumo por Usuário
            </h2>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-center">Recargas</TableHead>
                <TableHead className="text-right">Consumo</TableHead>
                <TableHead className="text-right">Ociosidade</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((item) => (
                <TableRow key={item.unidade}>
                  <TableCell className="font-medium">{item.usuario}</TableCell>
                  <TableCell>
                    {item.unidade} {item.torre && `(${item.torre})`}
                  </TableCell>
                  <TableCell className="text-center">{item.recargas}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.consumo)} kWh
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {item.ociosidade}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(item.valor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PDF Preview placeholder */}
      <div className="mt-8 bg-card rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">
            PDF do Relatório
          </h2>
        </div>
        <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Visualização do PDF disponível após integração com API
            </p>
            <Button variant="vetric" className="mt-4 gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

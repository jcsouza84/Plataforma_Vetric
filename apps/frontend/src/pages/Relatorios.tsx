/**
 * 📄 VETRIC - Página de Relatórios
 * Admin: Upload/Download/Delete
 * Cliente: Download apenas
 */

import { useState } from 'react';
import { Search, Upload, Download, Trash2, FileText, Calendar, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRelatorios, useUploadRelatorio, useDeleteRelatorio } from '@/hooks/useVetricData';
import { vetricAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


const meses = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export default function Relatorios() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { data: relatorios, isLoading } = useRelatorios();
  const uploadMutation = useUploadRelatorio();
  const deleteMutation = useDeleteRelatorio();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [mesFilter, setMesFilter] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    titulo: '',
    mes: '',
    ano: new Date().getFullYear().toString(),
  });

  // Filtrar relatórios
  const filteredRelatorios = (relatorios || []).filter((r: any) => {
    const matchSearch = r.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMes = mesFilter === 'all' || r.mes.toString() === mesFilter;
    return matchSearch && matchMes;
  });

  // Handler de upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Sugerir título automaticamente
      if (!uploadData.titulo) {
        setUploadData({
          ...uploadData,
          titulo: `Relatório ${uploadData.mes}/${uploadData.ano}`,
        });
      }
    } else {
      alert('Por favor, selecione um arquivo PDF');
    }
  };

  // Handler de upload final
  const handleUpload = async () => {
    if (!selectedFile || !uploadData.mes || !uploadData.ano) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('arquivo', selectedFile);
      formData.append('titulo', uploadData.titulo);
      formData.append('mes', uploadData.mes);
      formData.append('ano', uploadData.ano);

      await uploadMutation.mutateAsync(formData);

      toast({
        title: 'Sucesso!',
        description: 'Relatório enviado com sucesso',
      });

      // Fechar modal e resetar
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadData({
        titulo: '',
        mes: '',
        ano: new Date().getFullYear().toString(),
      });
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    }
  };

  // Handler de download
  const handleDownload = async (relatorioId: number, titulo: string) => {
    try {
      const blob = await vetricAPI.downloadRelatorio(relatorioId);
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${titulo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download iniciado',
        description: `Baixando ${titulo}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro no download',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handler de delete (Admin only)
  const handleDelete = async (relatorioId: number, titulo: string) => {
    if (confirm(`Tem certeza que deseja deletar "${titulo}"?`)) {
      try {
        await deleteMutation.mutateAsync(relatorioId);
        toast({
          title: 'Sucesso!',
          description: 'Relatório deletado com sucesso',
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao deletar',
          description: error.response?.data?.error || error.message,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Relatórios
            </h1>
            <p className="mt-1 text-muted-foreground">
              Visualize e baixe os relatórios mensais do seu empreendimento
            </p>
          </div>

          {/* Botão Upload (Admin only) */}
          {isAdmin && (
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="gap-2 bg-orange-500 hover:bg-orange-600"
            >
              <Upload size={18} />
              Novo Relatório
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar mês/ano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={mesFilter} onValueChange={setMesFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todos os meses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {meses.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Relatórios */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredRelatorios.length > 0 ? (
          filteredRelatorios.map((relatorio: any) => (
            <div
              key={relatorio.id}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Ícone */}
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg shrink-0">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {relatorio.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gerado em {new Date(relatorio.criado_em).toLocaleString('pt-BR')}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {relatorio.tamanho_kb} KB
                  </Badge>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(relatorio.id, relatorio.titulo)}
                    className="gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    <Download size={16} />
                    Baixar PDF
                  </Button>

                  {/* Botão Delete (Admin only) */}
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(relatorio.id, relatorio.titulo)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card border rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {searchTerm || mesFilter !== 'all'
                ? 'Nenhum relatório encontrado'
                : 'Nenhum relatório disponível'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Upload (Admin only) */}
      {isAdmin && (
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enviar Novo Relatório</DialogTitle>
              <DialogDescription>
                Faça upload do PDF do relatório mensal. Se já existir um relatório
                para o mesmo mês/ano, ele será substituído.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Seleção de Arquivo */}
              <div className="space-y-2">
                <Label htmlFor="arquivo">
                  Arquivo PDF <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="arquivo"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <Badge variant="secondary" className="mt-2">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </Badge>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Relatório Janeiro 2026"
                  value={uploadData.titulo}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, titulo: e.target.value })
                  }
                />
              </div>

              {/* Mês */}
              <div className="space-y-2">
                <Label htmlFor="mes">
                  Mês <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={uploadData.mes}
                  onValueChange={(value) =>
                    setUploadData({ ...uploadData, mes: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ano */}
              <div className="space-y-2">
                <Label htmlFor="ano">
                  Ano <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ano"
                  type="number"
                  min="2020"
                  max="2030"
                  value={uploadData.ano}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, ano: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadModalOpen(false)}
                disabled={uploadMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !uploadData.mes || !uploadData.ano || uploadMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

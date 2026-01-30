/**
 * 📤 VETRIC Reports - Upload de Relatório (XLSX)
 * 🆕 COM PREVIEW COMPLETO: Gráficos, Resumos, Detalhamento
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, Loader2, CheckCircle, AlertCircle, FileSpreadsheet, Calendar, DollarSign, Zap, Clock, Users as UsersIcon, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function UploadRelatorio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setPreview(null);
      } else {
        toast({
          title: 'Formato inválido',
          description: 'Por favor, selecione um arquivo .xlsx ou .xls',
          variant: 'destructive',
        });
      }
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setPreviewLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('empreendimentoId', id!);

      const token = localStorage.getItem('@vetric:token');
      const response = await fetch('http://localhost:3001/api/vetric-reports/preview-xlsx', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar arquivo');
      }
    } catch (error: any) {
      console.error('Erro no preview:', error);
      toast({
        title: 'Erro no preview',
        description: error.message || 'Não foi possível processar o arquivo',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('empreendimentoId', id!);

      const token = localStorage.getItem('@vetric:token');
      const response = await fetch('http://localhost:3001/api/vetric-reports/gerar-relatorio', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Relatório gerado!',
          description: 'O relatório foi salvo com sucesso',
        });
        navigate(`/vetric-reports/${id}/relatorios`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar relatório');
      }
    } catch (error: any) {
      console.error('Erro ao gerar:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message || 'Não foi possível gerar o relatório',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/vetric-reports/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload de Planilha</h1>
          <p className="text-gray-600">Importe os dados de carregamento do CVE Pro</p>
        </div>

        {/* Área de Upload */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                1. Importar Extrato CVE Pro
              </h3>
              <p className="text-sm text-gray-600">Formato: .xlsx ou .xls</p>
            </div>
          </div>

          {/* Input de arquivo */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              {file ? (
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="mt-4 text-sm text-orange-500 hover:text-orange-600"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Clique para selecionar o arquivo
                  </p>
                  <p className="text-sm text-gray-500">Formatos aceitos: .xlsx, .xls</p>
                </div>
              )}
            </label>
          </div>

          {/* Botão de Preview */}
          {file && !preview && (
            <div className="mt-6">
              <Button
                onClick={handlePreview}
                disabled={previewLoading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {previewLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Visualizar Preview
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Preview Completo */}
        {preview && (
          <>
            {/* Cards de Resumo */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">2. Preview dos Dados</h3>
                  <p className="text-sm text-gray-600">Revise antes de gerar o relatório</p>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-600 uppercase">Total</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{preview.totalRegistros}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-700 uppercase">Válidos</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{preview.validos}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-semibold text-red-700 uppercase">Rejeitados</p>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{preview.rejeitados}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700 uppercase">Período</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{preview.mesAno}</p>
                </div>
              </div>

              {/* Resumo Geral */}
              {preview.resumoGeral && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <p className="text-sm font-semibold text-orange-900">Consumo Total</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">
                      {preview.resumoGeral.totalConsumo.toFixed(2)} kWh
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-900">Valor Total</p>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      R$ {preview.resumoGeral.totalValor.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-900">Recargas</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {preview.resumoGeral.totalRecargas}
                    </p>
                  </div>
                </div>
              )}

              {/* Alertas */}
              {preview.alertas && preview.alertas.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-2">Atenção:</p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {preview.alertas.map((alerta: string, idx: number) => (
                          <li key={idx}>• {alerta}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gráfico de Consumo por Estação */}
            {preview.dadosGrafico && preview.dadosGrafico.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Consumo por Estação de Carregamento
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={preview.dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="estacao" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consumo" fill="#f97316" name="Consumo (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Resumo de Ociosidade */}
            {preview.resumoOciosidade && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Resumo de Ociosidade</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-red-700 mb-1">Total de Ocorrências</p>
                    <p className="text-2xl font-bold text-red-900">
                      {preview.resumoOciosidade.totalOcorrencias}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-red-700 mb-1">Tempo Total Ocioso</p>
                    <p className="text-2xl font-bold text-red-900">
                      {preview.resumoOciosidade.tempoTotalOciosoFormatado}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detalhamento por Morador */}
            {preview.resumoPorUsuario && preview.resumoPorUsuario.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <UsersIcon className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalhamento por Morador (Top 10)
                  </h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Morador</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Recargas</TableHead>
                      <TableHead className="text-right">Consumo (kWh)</TableHead>
                      <TableHead className="text-right">Valor (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.resumoPorUsuario.slice(0, 10).map((usuario: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{usuario.nome}</TableCell>
                        <TableCell>
                          {usuario.torre} - {usuario.unidade}
                        </TableCell>
                        <TableCell className="text-right">{usuario.recargas}</TableCell>
                        <TableCell className="text-right">
                          {usuario.consumo.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {usuario.valor.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {preview.resumoPorUsuario.length > 10 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    + {preview.resumoPorUsuario.length - 10} moradores não exibidos
                  </p>
                )}
              </div>
            )}

            {/* Botão de Gerar Relatório */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Gerar Relatório Final
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

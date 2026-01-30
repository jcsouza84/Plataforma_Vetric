/**
 * 📤 VETRIC Reports - Upload de Relatório (XLSX)
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
        toast({
          title: 'Erro no preview',
          description: error.error || 'Não foi possível processar o arquivo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o arquivo',
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
          title: 'Sucesso!',
          description: 'Relatório gerado com sucesso e salvo no banco de dados!',
        });
        navigate(`/relatorios-vetric/${id}/relatorios/${data.relatorioId}`);
      } else {
        const error = await response.json();
        toast({
          title: 'Erro ao gerar relatório',
          description: error.error || 'Não foi possível gerar o relatório',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/relatorios-vetric/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Upload className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gerar Novo Relatório
          </h1>
        </div>
        <p className="text-gray-600">
          Faça upload de uma planilha XLSX exportada do sistema de carregamento
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                </p>
                <p className="text-xs text-gray-500">Arquivo XLSX ou XLS</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Arquivo Selecionado */}
          {file && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}

          {/* Botões */}
          {file && !preview && (
            <Button
              onClick={handlePreview}
              disabled={previewLoading}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {previewLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Validar Arquivo'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Validação do Arquivo
          </h3>

          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-1">Mês/Ano</p>
                <p className="text-2xl font-bold text-blue-900">{preview.mesAno}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium mb-1">Validados</p>
                <p className="text-2xl font-bold text-green-900">{preview.validos}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium mb-1">Rejeitados</p>
                <p className="text-2xl font-bold text-red-900">{preview.rejeitados}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{preview.totalRegistros}</p>
              </div>
            </div>

            {/* Alertas */}
            {preview.alertas && preview.alertas.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 mb-2">Alertas:</p>
                    <ul className="space-y-1">
                      {preview.alertas.map((alerta: string, index: number) => (
                        <li key={index} className="text-sm text-yellow-800">
                          • {alerta}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Sucesso ou Falha */}
            {preview.validos > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800">
                    Arquivo validado com sucesso! {preview.validos} transações serão processadas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">
                    Nenhuma transação válida encontrada. Verifique os alertas acima.
                  </p>
                </div>
              </div>
            )}

            {/* Botão de Gerar */}
            {preview.validos > 0 && (
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Relatório...
                  </>
                ) : (
                  'Gerar Relatório Completo'
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * 📊 VETRIC Reports - Visualização de Relatório
 * 🔥 COM CORREÇÃO DO BUG: Busca dados do BD, NÃO do localStorage!
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, BarChart3, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DadosRelatorio {
  mesAno: string;
  empreendimento: {
    nome: string;
    logoUrl?: string;
  };
  resumoGeral: {
    totalRecargas: number;
    totalConsumo: number;
    totalValor: number;
    totalDuracao: number;
  };
  resumoPorUsuario: Array<{
    usuario: string;
    unidade: string;
    torre: string;
    totalCargas: number;
    totalEnergiaKWh: number;
    valorTotal: number;
    ocorrenciasOciosidade: number;
    tempoOciosoFormatado: string;
  }>;
}

export function VisualizarRelatorio() {
  const { id, relatorioId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dados, setDados] = useState<DadosRelatorio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRelatorio();
  }, [relatorioId]);

  /**
   * 🔥 CORREÇÃO DO BUG: Busca do BANCO, NÃO do localStorage!
   */
  const carregarRelatorio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/vetric-reports/relatorios/${relatorioId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDados(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Relatório não encontrado',
          variant: 'destructive',
        });
        navigate(`/relatorios-vetric/${id}/relatorios`);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o relatório',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-gray-700 font-medium">Carregando relatório do banco de dados...</span>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="p-6">
        <p className="text-red-500">Relatório não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/relatorios-vetric/${id}/relatorios`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Relatórios
        </Button>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Relatório {dados.mesAno}
              </h1>
              <p className="text-gray-600">{dados.empreendimento.nome}</p>
            </div>
            {dados.empreendimento.logoUrl && (
              <img
                src={dados.empreendimento.logoUrl}
                alt={dados.empreendimento.nome}
                className="w-24 h-24 object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total de Recargas</p>
          <p className="text-3xl font-bold">{dados.resumoGeral.totalRecargas}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Consumo Total</p>
          <p className="text-3xl font-bold">{dados.resumoGeral.totalConsumo.toFixed(2)}</p>
          <p className="text-xs opacity-75">kWh</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Valor Total</p>
          <p className="text-3xl font-bold">R$ {dados.resumoGeral.totalValor.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Duração Total</p>
          <p className="text-3xl font-bold">{dados.resumoGeral.totalDuracao.toFixed(1)}</p>
          <p className="text-xs opacity-75">horas</p>
        </div>
      </div>

      {/* Resumo por Usuário */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo por Usuário</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuário</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Unidade</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Cargas</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Energia (kWh)</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor (R$)</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ociosidades</th>
              </tr>
            </thead>
            <tbody>
              {dados.resumoPorUsuario.map((usuario, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{usuario.usuario}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {usuario.torre} - {usuario.unidade}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900">{usuario.totalCargas}</td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {usuario.totalEnergiaKWh.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">
                    {usuario.valorTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {usuario.ocorrenciasOciosidade > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {usuario.ocorrenciasOciosidade} ({usuario.tempoOciosoFormatado})
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info de Correção do Bug */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          ✅ <strong>Relatório salvo permanentemente no banco de dados!</strong> Você pode fechar o navegador e 
          acessar este relatório a qualquer momento. O bug do localStorage foi corrigido.
        </p>
      </div>
    </div>
  );
}


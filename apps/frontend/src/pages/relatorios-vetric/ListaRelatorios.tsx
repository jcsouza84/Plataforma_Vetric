/**
 * 📄 VETRIC Reports - Lista de Relatórios Gerados
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, Eye, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

interface Relatorio {
  id: string;
  mes_ano: string;
  total_recargas: number;
  total_consumo: number;
  total_valor: number;
  criado_em: string;
}

export function ListaRelatorios() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatorios();
  }, [id]);

  const fetchRelatorios = async () => {
    try {
      const token = localStorage.getItem('@vetric:token');
      const response = await fetch(
        `http://localhost:3001/api/vetric-reports/empreendimentos/${id}/relatorios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRelatorios(data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os relatórios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="p-6">
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatórios Gerados
            </h1>
            <p className="text-gray-600">
              Visualize e gerencie os relatórios mensais
            </p>
          </div>

          <Link to={`/relatorios-vetric/${id}/upload`}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <FileText className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </Link>
        </div>
      </div>

      {/* Lista */}
      {relatorios.length === 0 ? (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum relatório gerado
          </h3>
          <p className="text-gray-600 mb-6">
            Comece fazendo upload de uma planilha XLSX para gerar seu primeiro relatório
          </p>
          <Link to={`/relatorios-vetric/${id}/upload`}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Primeiro Relatório
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatorios.map((relatorio) => (
            <Link
              key={relatorio.id}
              to={`/relatorios-vetric/${id}/relatorios/${relatorio.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-orange-500 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                        {relatorio.mes_ano}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(relatorio.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recargas:</span>
                    <span className="font-semibold text-gray-900">
                      {relatorio.total_recargas}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consumo:</span>
                    <span className="font-semibold text-gray-900">
                      {Number(relatorio.total_consumo).toFixed(2)} kWh
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-semibold text-green-600">
                      R$ {Number(relatorio.total_valor).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-orange-500">Visualizar</span>
                  <Eye className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}


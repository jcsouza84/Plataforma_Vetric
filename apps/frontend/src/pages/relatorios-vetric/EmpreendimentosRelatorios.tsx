/**
 * 🏢 VETRIC Reports - Página de Empreendimentos
 * Lista de empreendimentos para geração de relatórios
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

interface EmpreendimentoRelatorio {
  id: string;
  nome: string;
  logo_url: string | null;
  sistema_carregamento: string;
  criado_em: string;
  total_usuarios?: number;
  total_relatorios?: number;
}

export function EmpreendimentosRelatorios() {
  const [empreendimentos, setEmpreendimentos] = useState<EmpreendimentoRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmpreendimentos();
  }, []);

  const fetchEmpreendimentos = async () => {
    try {
      const token = localStorage.getItem('@vetric:token');
      
      if (!token) {
        toast({
          title: 'Sessão expirada',
          description: 'Por favor, faça login novamente',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/vetric-reports/empreendimentos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        console.error('Erro da API:', errorData);
        
        if (response.status === 401) {
          toast({
            title: 'Sessão expirada',
            description: 'Por favor, faça login novamente',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao carregar',
            description: errorData.message || 'Não foi possível carregar os empreendimentos',
            variant: 'destructive',
          });
        }
        return;
      }

      const data = await response.json();
      console.log('Empreendimentos carregados:', data);
      setEmpreendimentos(data);
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os empreendimentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-gray-700 font-medium">Carregando empreendimentos...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Relatórios
        </h1>
        <p className="text-gray-600">
          Selecione um empreendimento para gerenciar relatórios de recarga
        </p>
      </div>

      {/* Grid de Empreendimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {empreendimentos.map((emp) => (
          <div key={emp.id} className="relative group">
            <Link to={`/relatorios-vetric/${emp.id}`}>
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 h-full flex flex-col hover:shadow-lg hover:border-orange-500 transition-all duration-300">
                {emp.logo_url && (
                  <div className="mb-4 h-32 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={emp.logo_url}
                      alt={emp.nome}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                    {emp.nome}
                  </h2>
                  <p className="text-sm text-gray-500 mb-1">
                    Sistema: {emp.sistema_carregamento}
                  </p>
                  <p className="text-xs text-gray-400">
                    Cadastrado em {new Date(emp.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-orange-500 font-semibold">
                  <span className="text-sm">Acessar Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Card para adicionar novo empreendimento */}
        <Link to="/relatorios-vetric/novo" className="group">
          <div className="bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 p-6 h-full flex flex-col items-center justify-center min-h-[240px] hover:border-orange-500 hover:bg-orange-50 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <Plus className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Novo Empreendimento
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Cadastre um novo condomínio
            </p>
          </div>
        </Link>
      </div>

      {/* Info vazia */}
      {empreendimentos.length === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 shadow-md">
          <div className="flex items-start gap-4">
            <Building2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Nenhum empreendimento cadastrado
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Para começar, cadastre seu primeiro empreendimento clicando no card acima.
                Você poderá configurar tarifas, cadastrar usuários e gerar relatórios automaticamente.
              </p>
              <Link to="/relatorios-vetric/novo">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-5 h-5 mr-2" />
                  Cadastrar Primeiro Empreendimento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}


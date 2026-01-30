/**
 * 📊 VETRIC Reports - Dashboard do Empreendimento
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  Upload,
  Settings,
  ArrowLeft,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Empreendimento {
  id: string;
  nome: string;
  logo_url: string | null;
  sistema_carregamento: string;
  total_usuarios?: number;
  total_relatorios?: number;
}

export function DashboardEmpreendimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [empreendimento, setEmpreendimento] = useState<Empreendimento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmpreendimento();
  }, [id]);

  const fetchEmpreendimento = async () => {
    try {
      const token = localStorage.getItem('@vetric:token');
      const response = await fetch(`http://localhost:3001/api/vetric-reports/empreendimentos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmpreendimento(data);
      }
    } catch (error) {
      console.error('Erro ao carregar empreendimento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o empreendimento',
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

  if (!empreendimento) {
    return (
      <div className="p-6">
        <p className="text-red-500">Empreendimento não encontrado</p>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Gerar Relatório',
      description: 'Faça upload de uma planilha XLSX para gerar o relatório',
      icon: Upload,
      link: `/relatorios-vetric/${id}/upload`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Relatórios Gerados',
      description: 'Visualize e gerencie os relatórios já criados',
      icon: FileText,
      link: `/relatorios-vetric/${id}/relatorios`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Usuários',
      description: 'Gerencie os usuários e suas TAGs',
      icon: Users,
      link: `/relatorios-vetric/${id}/usuarios`,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Configurações',
      description: 'Configure tarifas e horários de ponta',
      icon: Settings,
      link: `/relatorios-vetric/${id}/configuracoes`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/relatorios-vetric')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Empreendimentos
        </Button>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            {empreendimento.logo_url ? (
              <img
                src={empreendimento.logo_url}
                alt={empreendimento.nome}
                className="w-24 h-24 object-contain rounded-lg bg-gray-50"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {empreendimento.nome}
              </h1>
              <p className="text-gray-600 mb-4">
                Sistema: {empreendimento.sistema_carregamento}
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {empreendimento.total_usuarios || 0} usuários
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {empreendimento.total_relatorios || 0} relatórios
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu de Opções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-orange-500 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


/**
 * 🏢 VETRIC Reports - Novo Empreendimento
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function NovoEmpreendimento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    logo_url: '',
    sistema_carregamento: 'CVE_PRO',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/vetric-reports/empreendimentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Sucesso!',
          description: 'Empreendimento criado com sucesso',
        });
        navigate(`/relatorios-vetric/${data.id}`);
      } else {
        throw new Error('Erro ao criar empreendimento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o empreendimento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/relatorios-vetric')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            Novo Empreendimento
          </h1>
        </div>
        <p className="text-gray-600">
          Cadastre um novo empreendimento para gerar relatórios
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">
            Nome do Empreendimento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Condomínio Gran Marine"
            required
            disabled={loading}
          />
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <Label htmlFor="logo_url">URL do Logo (opcional)</Label>
          <Input
            id="logo_url"
            type="url"
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            placeholder="https://exemplo.com/logo.png"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Adicione uma URL pública do logo do empreendimento
          </p>
        </div>

        {/* Sistema de Carregamento */}
        <div className="space-y-2">
          <Label htmlFor="sistema">Sistema de Carregamento</Label>
          <Select
            value={formData.sistema_carregamento}
            onValueChange={(value) =>
              setFormData({ ...formData, sistema_carregamento: value })
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CVE_PRO">CVE PRO</SelectItem>
              <SelectItem value="WEMOB">WEMOB</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/relatorios-vetric')}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Empreendimento'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


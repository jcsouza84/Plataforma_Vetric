/**
 * ⚙️ VETRIC Reports - Configurações Tarifárias
 * Gerenciamento de tarifas e horários de ponta
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

interface ConfiguracaoTarifaria {
  id: string;
  empreendimento_id: string;
  tarifa_ponta: number;
  tarifa_fora_ponta: number;
  ponta_inicio_hora: number;
  ponta_inicio_minuto: number;
  ponta_fim_hora: number;
  ponta_fim_minuto: number;
  ponta_segunda: boolean;
  ponta_terca: boolean;
  ponta_quarta: boolean;
  ponta_quinta: boolean;
  ponta_sexta: boolean;
  ponta_sabado: boolean;
  ponta_domingo: boolean;
  limite_energia_max_kwh: number;
  limite_ociosidade_min: number;
}

export default function ConfiguracoesRelatorio() {
  const { empreendimentoId } = useParams<{ empreendimentoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfiguracaoTarifaria | null>(null);

  const [formData, setFormData] = useState({
    tarifa_ponta: 3.08,
    tarifa_fora_ponta: 0.53,
    ponta_inicio_hora: 17,
    ponta_inicio_minuto: 30,
    ponta_fim_hora: 20,
    ponta_fim_minuto: 29,
    ponta_segunda: true,
    ponta_terca: true,
    ponta_quarta: true,
    ponta_quinta: true,
    ponta_sexta: false,
    ponta_sabado: false,
    ponta_domingo: false,
    limite_energia_max_kwh: 50,
    limite_ociosidade_min: 15,
  });

  useEffect(() => {
    fetchConfiguracao();
  }, [empreendimentoId]);

  const fetchConfiguracao = async () => {
    try {
      const token = localStorage.getItem('@vetric:token');
      const response = await fetch(
        `http://localhost:3001/api/vetric-reports/empreendimentos/${empreendimentoId}/configuracao`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setFormData({
          tarifa_ponta: data.tarifa_ponta,
          tarifa_fora_ponta: data.tarifa_fora_ponta,
          ponta_inicio_hora: data.ponta_inicio_hora,
          ponta_inicio_minuto: data.ponta_inicio_minuto,
          ponta_fim_hora: data.ponta_fim_hora,
          ponta_fim_minuto: data.ponta_fim_minuto,
          ponta_segunda: data.ponta_segunda,
          ponta_terca: data.ponta_terca,
          ponta_quarta: data.ponta_quarta,
          ponta_quinta: data.ponta_quinta,
          ponta_sexta: data.ponta_sexta,
          ponta_sabado: data.ponta_sabado,
          ponta_domingo: data.ponta_domingo,
          limite_energia_max_kwh: data.limite_energia_max_kwh,
          limite_ociosidade_min: data.limite_ociosidade_min,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('@vetric:token');
      const response = await fetch(
        `http://localhost:3001/api/vetric-reports/empreendimentos/${empreendimentoId}/configuracao`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Configurações salvas com sucesso',
        });
        fetchConfiguracao();
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/vetric-reports/${empreendimentoId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações Tarifárias</h1>
            <p className="text-gray-600">Configure tarifas e horários de ponta</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tarifas */}
        <Card>
          <CardHeader>
            <CardTitle>💰 Tarifas de Energia</CardTitle>
            <CardDescription>Valores em R$ por kWh</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tarifa_ponta">Tarifa de Ponta (R$/kWh)</Label>
                <Input
                  id="tarifa_ponta"
                  type="number"
                  step="0.01"
                  value={formData.tarifa_ponta}
                  onChange={(e) =>
                    setFormData({ ...formData, tarifa_ponta: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tarifa_fora_ponta">Tarifa Fora de Ponta (R$/kWh)</Label>
                <Input
                  id="tarifa_fora_ponta"
                  type="number"
                  step="0.01"
                  value={formData.tarifa_fora_ponta}
                  onChange={(e) =>
                    setFormData({ ...formData, tarifa_fora_ponta: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Ponta */}
        <Card>
          <CardHeader>
            <CardTitle>🕐 Horário de Ponta</CardTitle>
            <CardDescription>Defina o período de horário de ponta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Hora"
                    min="0"
                    max="23"
                    value={formData.ponta_inicio_hora}
                    onChange={(e) =>
                      setFormData({ ...formData, ponta_inicio_hora: parseInt(e.target.value) })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="59"
                    value={formData.ponta_inicio_minuto}
                    onChange={(e) =>
                      setFormData({ ...formData, ponta_inicio_minuto: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fim</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Hora"
                    min="0"
                    max="23"
                    value={formData.ponta_fim_hora}
                    onChange={(e) =>
                      setFormData({ ...formData, ponta_fim_hora: parseInt(e.target.value) })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="59"
                    value={formData.ponta_fim_minuto}
                    onChange={(e) =>
                      setFormData({ ...formData, ponta_fim_minuto: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dias da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Dias com Horário de Ponta</CardTitle>
            <CardDescription>Selecione os dias da semana que possuem horário de ponta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'ponta_segunda', label: 'Segunda-feira' },
              { key: 'ponta_terca', label: 'Terça-feira' },
              { key: 'ponta_quarta', label: 'Quarta-feira' },
              { key: 'ponta_quinta', label: 'Quinta-feira' },
              { key: 'ponta_sexta', label: 'Sexta-feira' },
              { key: 'ponta_sabado', label: 'Sábado' },
              { key: 'ponta_domingo', label: 'Domingo' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={formData[key as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Limites de Validação */}
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Limites de Validação</CardTitle>
            <CardDescription>Configurações para detecção de anomalias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limite_energia">Energia Máxima (kWh)</Label>
                <Input
                  id="limite_energia"
                  type="number"
                  value={formData.limite_energia_max_kwh}
                  onChange={(e) =>
                    setFormData({ ...formData, limite_energia_max_kwh: parseFloat(e.target.value) })
                  }
                />
                <p className="text-xs text-gray-500">
                  Alertar cargas acima deste valor
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limite_ociosidade">Ociosidade Máxima (min)</Label>
                <Input
                  id="limite_ociosidade"
                  type="number"
                  value={formData.limite_ociosidade_min}
                  onChange={(e) =>
                    setFormData({ ...formData, limite_ociosidade_min: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-gray-500">
                  Alertar tempo ocioso acima deste limite
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}


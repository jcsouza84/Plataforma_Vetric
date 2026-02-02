/**
 * ⚙️ VETRIC - Página de Configurações (ADMIN ONLY)
 */

import { useState, useEffect } from 'react';
import { Save, Bell, Zap, Loader2, Send, Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemplates, useUpdateTemplate, useConfiguracoes, useUpdateConfiguracoes } from '@/hooks/useVetricData';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/api';

export default function Configuracoes() {
  const { toast } = useToast();
  const { data: templates, isLoading } = useTemplates();
  const updateMutation = useUpdateTemplate();
  
  // Configurações Evolution API
  const { data: configuracoes, isLoading: isLoadingConfigs } = useConfiguracoes();
  const updateConfiguracoesMutation = useUpdateConfiguracoes();

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<{ 
    [key: string]: { 
      mensagem: string; 
      ativo: boolean;
      tempo_minutos?: number;
      power_threshold_w?: number;
    } 
  }>({});
  
  // Estado para teste Evolution API
  const [testPhone, setTestPhone] = useState('5582996176797');
  const [testMessage, setTestMessage] = useState('🧪 Teste de integração Evolution API\n\nSistema VETRIC Gran Marine funcionando!');
  const [isSendingTest, setIsSendingTest] = useState(false);
  
  // Estado para configurações Evolution API editáveis
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [evolutionInstance, setEvolutionInstance] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditingEvolution, setIsEditingEvolution] = useState(false);
  
  // Estado para reiniciar backend
  const [showRestartPrompt, setShowRestartPrompt] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartCountdown, setRestartCountdown] = useState(0);

  // Carregar configurações do banco
  useEffect(() => {
    if (configuracoes && configuracoes.length > 0) {
      const urlConfig = configuracoes.find((c: any) => c.chave === 'evolution_api_url');
      const keyConfig = configuracoes.find((c: any) => c.chave === 'evolution_api_key');
      const instanceConfig = configuracoes.find((c: any) => c.chave === 'evolution_instance');

      setEvolutionApiUrl(urlConfig?.valor || '');
      setEvolutionApiKey(keyConfig?.valor || '');
      setEvolutionInstance(instanceConfig?.valor || '');
    }
  }, [configuracoes]);

  const handleEditTemplate = (tipo: string, template: any) => {
    setEditingTemplate(tipo);
    setTemplateData({
      ...templateData,
      [tipo]: { 
        mensagem: template.mensagem, 
        ativo: template.ativo,
        tempo_minutos: template.tempo_minutos || 0,
        power_threshold_w: template.power_threshold_w || null,
      },
    });
  };

  const handleSaveTemplate = async (tipo: string) => {
    try {
      await updateMutation.mutateAsync({
        tipo,
        updates: templateData[tipo],
      });

      toast({
        title: 'Sucesso!',
        description: 'Template atualizado com sucesso',
      });

      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    }
  };


  const handleSendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o telefone e a mensagem',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingTest(true);

    try {
      const response = await api.testEvolutionApi(testPhone, testMessage);

      toast({
        title: 'Mensagem enviada!',
        description: `Teste enviado para ${testPhone}`,
      });

      console.log('✅ Resposta Evolution API:', response);
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveEvolutionConfig = async () => {
    try {
      await updateConfiguracoesMutation.mutateAsync([
        { chave: 'evolution_api_url', valor: evolutionApiUrl },
        { chave: 'evolution_api_key', valor: evolutionApiKey },
        { chave: 'evolution_instance', valor: evolutionInstance },
      ]);

      toast({
        title: 'Configurações salvas!',
        description: 'As configurações da Evolution API foram atualizadas com sucesso.',
      });

      setIsEditingEvolution(false);
      setShowRestartPrompt(true); // Mostrar prompt de reiniciar
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRestartBackend = async () => {
    setIsRestarting(true);
    setRestartCountdown(10);

    try {
      // Chamar API de restart
      await api.restartBackend();

      toast({
        title: 'Backend reiniciando...',
        description: 'O backend será reiniciado em alguns segundos.',
      });

      // Contador regressivo
      let countdown = 10;
      const interval = setInterval(() => {
        countdown--;
        setRestartCountdown(countdown);

        if (countdown <= 0) {
          clearInterval(interval);
          setIsRestarting(false);
          setShowRestartPrompt(false);
          
          toast({
            title: 'Backend reiniciado!',
            description: 'As novas configurações estão ativas.',
          });

          // Recarregar a página para reconectar
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }, 1000);

    } catch (error: any) {
      setIsRestarting(false);
      toast({
        title: 'Erro ao reiniciar',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    }
  };

  const templateInfo = {
    inicio: {
      title: '🔋 Início de Recarga',
      description: 'Enviado IMEDIATAMENTE quando o carregamento é iniciado (StartTransaction)',
      variables: ['{{nome}}', '{{charger}}', '{{localizacao}}', '{{data}}', '{{apartamento}}'],
      hasTempo: false,
      hasThreshold: false,
    },
    inicio_ociosidade: {
      title: '⚠️ Início de Ociosidade',
      description: 'Enviado IMEDIATAMENTE quando a potência cai abaixo do threshold (bateria pode estar cheia)',
      variables: ['{{nome}}', '{{charger}}', '{{energia}}', '{{data}}'],
      hasTempo: false,
      hasThreshold: true,
      thresholdLabel: 'Potência mínima (W)',
      thresholdHelp: 'Detecta quando power cai abaixo deste valor (ex: 10W)',
    },
    bateria_cheia: {
      title: '🔋 Bateria Cheia',
      description: 'Enviado APÓS X MINUTOS com potência baixa (confirma que bateria está carregada)',
      variables: ['{{nome}}', '{{charger}}', '{{energia}}', '{{duracao}}'],
      hasTempo: true,
      hasThreshold: true,
      tempoLabel: 'Tempo de espera (minutos)',
      tempoHelp: 'Aguarda X minutos em baixa potência antes de enviar (ex: 3 min)',
      thresholdLabel: 'Potência mínima (W)',
      thresholdHelp: 'Considera que está ocioso se power ≤ este valor (ex: 10W)',
    },
    interrupcao: {
      title: '⚠️ Interrupção',
      description: 'Enviado IMEDIATAMENTE quando o carregamento para inesperadamente (não foi fim normal)',
      variables: ['{{nome}}', '{{charger}}', '{{energia}}', '{{duracao}}'],
      hasTempo: false,
      hasThreshold: false,
    },
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Configurações do Sistema
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure notificações, integrações e templates de mensagens
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <Bell size={16} />
            Templates WhatsApp
          </TabsTrigger>
          <TabsTrigger value="evolution" className="gap-2">
            <Zap size={16} />
            Evolution API
          </TabsTrigger>
        </TabsList>

        {/* Templates WhatsApp */}
        <TabsContent value="templates" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            templates?.map((template: any) => {
              const info = templateInfo[template.tipo as keyof typeof templateInfo];
              const isEditing = editingTemplate === template.tipo;
              const currentData = templateData[template.tipo] || {
                mensagem: template.mensagem,
                ativo: template.ativo,
              };

              return (
                <Card key={template.tipo}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{info?.title}</CardTitle>
                        <CardDescription>{info?.description}</CardDescription>
                      </div>
                      <Switch
                        checked={isEditing ? currentData.ativo : template.ativo}
                        onCheckedChange={async (checked) => {
                          if (isEditing) {
                            // Apenas atualizar estado local se estiver editando
                            setTemplateData({
                              ...templateData,
                              [template.tipo]: { ...currentData, ativo: checked },
                            });
                          } else {
                            // Fazer chamada direta da API se não estiver editando
                            try {
                              await updateMutation.mutateAsync({
                                tipo: template.tipo,
                                updates: { ativo: checked },
                              });

                              toast({
                                title: checked ? 'Notificação ativada!' : 'Notificação desativada!',
                                description: `Template "${info?.title}" foi ${checked ? 'ativado' : 'desativado'}`,
                              });
                            } catch (error: any) {
                              toast({
                                title: 'Erro ao atualizar',
                                description: error.response?.data?.error || error.message,
                                variant: 'destructive',
                              });
                            }
                          }
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Variáveis Disponíveis */}
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Variáveis disponíveis:
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {info?.variables.map((v) => (
                          <code
                            key={v}
                            className="px-2 py-1 text-xs bg-muted rounded font-mono"
                          >
                            {v}
                          </code>
                        ))}
                      </div>
                    </div>

                    {/* Mensagem */}
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      {isEditing ? (
                        <Textarea
                          value={currentData.mensagem}
                          onChange={(e) =>
                            setTemplateData({
                              ...templateData,
                              [template.tipo]: {
                                ...currentData,
                                mensagem: e.target.value,
                              },
                            })
                          }
                          rows={8}
                          className="font-mono text-sm"
                        />
                      ) : (
                        <div className="p-3 bg-muted rounded-lg whitespace-pre-wrap font-mono text-sm">
                          {template.mensagem}
                        </div>
                      )}
                    </div>

                    {/* Campos Avançados (tempo_minutos e power_threshold_w) */}
                    {(info?.hasTempo || info?.hasThreshold) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Tempo de Espera */}
                        {info?.hasTempo && (
                          <div className="space-y-2">
                            <Label htmlFor={`tempo-${template.tipo}`}>
                              {info.tempoLabel}
                            </Label>
                            {isEditing ? (
                              <Input
                                id={`tempo-${template.tipo}`}
                                type="number"
                                min="0"
                                max="1440"
                                value={currentData.tempo_minutos || 0}
                                onChange={(e) =>
                                  setTemplateData({
                                    ...templateData,
                                    [template.tipo]: {
                                      ...currentData,
                                      tempo_minutos: parseInt(e.target.value) || 0,
                                    },
                                  })
                                }
                                className="font-mono"
                              />
                            ) : (
                              <div className="p-2 bg-muted rounded text-sm font-mono">
                                {template.tempo_minutos || 0} minutos
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {info.tempoHelp}
                            </p>
                          </div>
                        )}

                        {/* Threshold de Potência */}
                        {info?.hasThreshold && (
                          <div className="space-y-2">
                            <Label htmlFor={`threshold-${template.tipo}`}>
                              {info.thresholdLabel}
                            </Label>
                            {isEditing ? (
                              <Input
                                id={`threshold-${template.tipo}`}
                                type="number"
                                min="0"
                                max="50000"
                                value={currentData.power_threshold_w || 0}
                                onChange={(e) =>
                                  setTemplateData({
                                    ...templateData,
                                    [template.tipo]: {
                                      ...currentData,
                                      power_threshold_w: parseInt(e.target.value) || null,
                                    },
                                  })
                                }
                                className="font-mono"
                              />
                            ) : (
                              <div className="p-2 bg-muted rounded text-sm font-mono">
                                {template.power_threshold_w || 0} W
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {info.thresholdHelp}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => handleSaveTemplate(template.tipo)}
                            disabled={updateMutation.isPending}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            {updateMutation.isPending ? (
                              <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save size={16} className="mr-2" />
                                Salvar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingTemplate(null)}
                            disabled={updateMutation.isPending}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleEditTemplate(template.tipo, template)}
                        >
                          Editar Template
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Evolution API */}
        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Evolution API</CardTitle>
              <CardDescription>
                Configure a integração com a Evolution API para envio de mensagens WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingConfigs ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="evolution-url">URL da API</Label>
                    <Input
                      id="evolution-url"
                      type="text"
                      value={evolutionApiUrl}
                      onChange={(e) => setEvolutionApiUrl(e.target.value)}
                      disabled={!isEditingEvolution}
                      className="font-mono"
                      placeholder="http://seu-servidor.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL completa da sua Evolution API
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evolution-key">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="evolution-key"
                        type={showApiKey ? 'text' : 'password'}
                        value={evolutionApiKey}
                        onChange={(e) => setEvolutionApiKey(e.target.value)}
                        disabled={!isEditingEvolution}
                        className="font-mono flex-1"
                        placeholder="Sua API Key"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Chave de autenticação da Evolution API
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evolution-instance">Instância</Label>
                    <Input
                      id="evolution-instance"
                      type="text"
                      value={evolutionInstance}
                      onChange={(e) => setEvolutionInstance(e.target.value)}
                      disabled={!isEditingEvolution}
                      className="font-mono"
                      placeholder="nome-da-instancia"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nome da instância configurada na Evolution API
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-2">
                    {isEditingEvolution ? (
                      <>
                        <Button
                          onClick={handleSaveEvolutionConfig}
                          disabled={updateConfiguracoesMutation.isPending}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          {updateConfiguracoesMutation.isPending ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save size={16} className="mr-2" />
                              Salvar Configurações
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingEvolution(false);
                            // Restaurar valores originais
                            if (configuracoes) {
                              const urlConfig = configuracoes.find((c: any) => c.chave === 'evolution_api_url');
                              const keyConfig = configuracoes.find((c: any) => c.chave === 'evolution_api_key');
                              const instanceConfig = configuracoes.find((c: any) => c.chave === 'evolution_instance');

                              setEvolutionApiUrl(urlConfig?.valor || '');
                              setEvolutionApiKey(keyConfig?.valor || '');
                              setEvolutionInstance(instanceConfig?.valor || '');
                            }
                          }}
                          disabled={updateConfiguracoesMutation.isPending}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingEvolution(true)}
                      >
                        Editar Configurações
                      </Button>
                    )}
                  </div>

                  {/* Status */}
                  {evolutionApiUrl && evolutionApiKey && evolutionInstance ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Evolution API configurada
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Reinicie o backend para aplicar as mudanças
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Configurações incompletas
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Preencha todos os campos para ativar a Evolution API
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      📱 Como funciona:
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                      <li>Notificações são enviadas automaticamente via WebSocket</li>
                      <li>Apenas moradores com telefone e notificações ativas recebem</li>
                      <li>Templates são personalizáveis na aba "Templates WhatsApp"</li>
                      <li>Logs de envio são salvos no banco de dados</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card de Reiniciar Backend */}
          {showRestartPrompt && (
            <Card className="border-orange-300 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <RefreshCw size={20} />
                  Reiniciar Backend Necessário
                </CardTitle>
                <CardDescription className="text-orange-700">
                  As configurações foram salvas, mas o backend precisa ser reiniciado para aplicá-las
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRestarting ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-orange-600 mb-4" />
                    <p className="text-lg font-semibold text-orange-900">
                      Reiniciando backend...
                    </p>
                    <p className="text-sm text-orange-700 mt-2">
                      {restartCountdown > 0 ? `Aguarde ${restartCountdown}s...` : 'Finalizando...'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleRestartBackend}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Reiniciar Agora
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRestartPrompt(false)}
                        className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        Reiniciar Depois
                      </Button>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-800 mb-2">
                        <strong>ℹ️ O que acontecerá:</strong>
                      </p>
                      <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
                        <li>O backend será encerrado em 2 segundos</li>
                        <li>O gerenciador de processos reiniciará automaticamente</li>
                        <li>As novas configurações serão carregadas</li>
                        <li>Esta página será recarregada após 10 segundos</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card de Teste de Envio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send size={20} />
                Testar Envio de Mensagem
              </CardTitle>
              <CardDescription>
                Envie uma mensagem de teste para validar a integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-phone">Telefone (com DDI)</Label>
                <Input
                  id="test-phone"
                  type="text"
                  placeholder="5582996176797"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: DDI + DDD + Número (sem espaços ou caracteres especiais)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Mensagem</Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={6}
                  placeholder="Digite a mensagem de teste..."
                />
              </div>

              <Button
                onClick={handleSendTestMessage}
                disabled={isSendingTest || !testPhone || !testMessage}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Enviar Mensagem de Teste
                  </>
                )}
              </Button>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Atenção:</strong> A mensagem será enviada imediatamente para o número informado.
                  Certifique-se de que o número está correto antes de enviar.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}


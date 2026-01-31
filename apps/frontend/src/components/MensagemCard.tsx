/**
 * 📧 Componente: Card de Edição de Mensagem de Notificação
 */

import { useState } from 'react';
import { Save, Edit, X, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { MensagemNotificacao } from '@/hooks/useMensagensNotificacoes';

interface MensagemCardProps {
  mensagem: MensagemNotificacao;
  onSave: (tipo: string, updates: Partial<MensagemNotificacao>) => Promise<void>;
  onToggle: (tipo: string) => Promise<void>;
  isSaving: boolean;
  isToggling: boolean;
}

const EMOJI_MAP: { [key: string]: string } = {
  inicio_recarga: '🔋',
  inicio_ociosidade: '⚠️',
  bateria_cheia: '🔋',
  interrupcao: '⚠️',
};

const DESCRICAO_MAP: { [key: string]: string } = {
  inicio_recarga: 'Enviado após X minutos do início do carregamento',
  inicio_ociosidade: 'Enviado IMEDIATAMENTE quando detecta o primeiro 0W',
  bateria_cheia: 'Enviado após X minutos de 0W (bateria cheia)',
  interrupcao: 'Enviado quando detecta 0W + SuspendedEV/StopTransaction',
};

const VARIAVEIS_MAP: { [key: string]: string[] } = {
  inicio_recarga: ['{{nome}}', '{{charger}}', '{{localizacao}}', '{{data}}', '{{apartamento}}'],
  inicio_ociosidade: ['{{nome}}', '{{charger}}', '{{consumo}}', '{{data}}'],
  bateria_cheia: ['{{nome}}', '{{charger}}', '{{consumo}}', '{{duracao}}'],
  interrupcao: ['{{nome}}', '{{charger}}', '{{consumo}}', '{{duracao}}'],
};

export function MensagemCard({ mensagem, onSave, onToggle, isSaving, isToggling }: MensagemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    titulo: mensagem.titulo,
    corpo: mensagem.corpo,
    tempo_minutos: mensagem.tempo_minutos,
    power_threshold_w: mensagem.power_threshold_w || 0,
  });

  const handleSave = async () => {
    await onSave(mensagem.tipo, editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({
      titulo: mensagem.titulo,
      corpo: mensagem.corpo,
      tempo_minutos: mensagem.tempo_minutos,
      power_threshold_w: mensagem.power_threshold_w || 0,
    });
    setIsEditing(false);
  };

  const emoji = EMOJI_MAP[mensagem.tipo] || '📧';
  const descricao = DESCRICAO_MAP[mensagem.tipo] || '';
  const variaveis = VARIAVEIS_MAP[mensagem.tipo] || [];
  const showPowerThreshold = mensagem.tipo === 'inicio_ociosidade' || mensagem.tipo === 'bateria_cheia';
  const showTempo = true; // Todos os cards têm tempo

  return (
    <Card className={`transition-all ${mensagem.ativo ? 'border-green-500' : 'border-gray-300'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              {isEditing ? (
                <Input
                  value={editedData.titulo}
                  onChange={(e) => setEditedData({ ...editedData, titulo: e.target.value })}
                  className="text-lg font-semibold"
                  placeholder="Título da mensagem"
                />
              ) : (
                <CardTitle className="text-lg">{mensagem.titulo}</CardTitle>
              )}
            </div>
            <CardDescription className="mt-2">{descricao}</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Switch
              checked={mensagem.ativo}
              onCheckedChange={() => onToggle(mensagem.tipo)}
              disabled={isToggling || isSaving}
            />
            <Badge variant={mensagem.ativo ? 'default' : 'secondary'}>
              {mensagem.ativo ? 'ATIVO' : 'DESLIGADO'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Configurações de Tempo e Power */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          {showTempo && (
            <div className="space-y-2">
              <Label htmlFor={`tempo-${mensagem.tipo}`} className="flex items-center gap-2">
                <Clock size={16} />
                Tempo (minutos)
              </Label>
              {isEditing ? (
                <Input
                  id={`tempo-${mensagem.tipo}`}
                  type="number"
                  min="0"
                  max="1440"
                  value={editedData.tempo_minutos}
                  onChange={(e) => setEditedData({ ...editedData, tempo_minutos: parseInt(e.target.value) || 0 })}
                  placeholder="0 = imediato"
                />
              ) : (
                <div className="text-sm font-medium">
                  {mensagem.tempo_minutos === 0 ? 'Imediato' : `${mensagem.tempo_minutos} min`}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {mensagem.tipo === 'inicio_ociosidade' 
                  ? 'Aguardar após detectar 0W' 
                  : mensagem.tipo === 'bateria_cheia'
                  ? 'Aguardar após minutos de 0W'
                  : 'Aguardar após início do carregamento'}
              </p>
            </div>
          )}

          {showPowerThreshold && (
            <div className="space-y-2">
              <Label htmlFor={`power-${mensagem.tipo}`} className="flex items-center gap-2">
                <Zap size={16} />
                Power Threshold (W)
              </Label>
              {isEditing ? (
                <Input
                  id={`power-${mensagem.tipo}`}
                  type="number"
                  min="0"
                  max="50000"
                  value={editedData.power_threshold_w}
                  onChange={(e) => setEditedData({ ...editedData, power_threshold_w: parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 10"
                />
              ) : (
                <div className="text-sm font-medium">
                  {mensagem.power_threshold_w ? `< ${mensagem.power_threshold_w}W` : 'Não configurado'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Potência menor que X = ocioso
              </p>
            </div>
          )}
        </div>

        {/* Corpo da mensagem */}
        <div className="space-y-2">
          <Label htmlFor={`corpo-${mensagem.tipo}`}>Mensagem</Label>
          {isEditing ? (
            <Textarea
              id={`corpo-${mensagem.tipo}`}
              value={editedData.corpo}
              onChange={(e) => setEditedData({ ...editedData, corpo: e.target.value })}
              rows={8}
              placeholder="Digite a mensagem..."
              className="font-mono text-sm"
            />
          ) : (
            <div className="p-3 bg-muted rounded-md whitespace-pre-wrap text-sm font-mono">
              {mensagem.corpo}
            </div>
          )}
        </div>

        {/* Variáveis disponíveis */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Variáveis disponíveis:</Label>
          <div className="flex flex-wrap gap-2">
            {variaveis.map((variavel) => (
              <Badge key={variavel} variant="outline" className="text-xs font-mono">
                {variavel}
              </Badge>
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isSaving || isToggling}
            >
              <Edit size={16} className="mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


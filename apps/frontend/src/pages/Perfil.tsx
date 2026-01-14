import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Perfil() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    atual: false,
    nova: false,
    confirmar: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para alterar a senha.',
        variant: 'destructive',
      });
      return;
    }

    if (novaSenha.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter no mínimo 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: 'Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi alterada com sucesso. Faça login novamente.',
      });

      // Logout after password change
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      toast({
        title: 'Erro ao alterar senha',
        description: 'Verifique a senha atual e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Fraca', color: 'bg-destructive', width: '33%' };
    if (password.length < 10) return { label: 'Média', color: 'bg-warning', width: '66%' };
    return { label: 'Forte', color: 'bg-success', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(novaSenha);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Meu Perfil
        </h1>
        <p className="mt-1 text-muted-foreground">
          Visualize suas informações e altere sua senha
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <div className="bg-card rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Informações Pessoais
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Nome</Label>
              <p className="mt-1 font-medium text-card-foreground">
                {user?.nome}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="mt-1 font-medium text-card-foreground">
                {user?.email}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Perfil</Label>
              <p className="mt-1 font-medium text-card-foreground">
                {user?.role === 'ADMIN' ? 'Administrador VETRIC' : 'Cliente'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p className="mt-1 font-medium text-card-foreground">
                {user?.ativo ? '✅ Ativo' : '❌ Inativo'}
              </p>
            </div>
          </div>

          <Alert className="mt-6 border-info/30 bg-info/5">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-info">
              Para alterar esses dados, contate o administrador VETRIC.
            </AlertDescription>
          </Alert>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Alterar Senha
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senhaAtual">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="senhaAtual"
                  type={showPasswords.atual ? 'text' : 'password'}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, atual: !showPasswords.atual })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.atual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="novaSenha"
                  type={showPasswords.nova ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, nova: !showPasswords.nova })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.nova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordStrength && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força da senha: <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showPasswords.confirmar ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirmar: !showPasswords.confirmar })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmarSenha && novaSenha !== confirmarSenha && (
                <p className="text-xs text-destructive">
                  As senhas não conferem
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              A senha deve ter no mínimo 8 caracteres
            </p>

            <Button
              type="submit"
              variant="vetric"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

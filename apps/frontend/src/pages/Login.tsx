/**
 * 🔐 VETRIC - Tela de Login
 * Design baseado no mockup fornecido
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, senha });
      
      // Redirecionar para dashboard após login
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo VETRIC */}
        <div className="text-center mb-8">
          <img 
            src="/vetric-logo.png" 
            alt="VETRIC" 
            className="h-16 mx-auto"
            onError={(e) => {
              // Fallback se a imagem não carregar
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuário */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Usuário
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="granmarine@vetric.com.br"
                required
                disabled={isLoading}
                className="h-12 border-slate-300 focus:border-[#1E40AF] focus:ring-[#1E40AF]"
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-slate-700 font-medium">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="h-12 border-slate-300 focus:border-[#1E40AF] focus:ring-[#1E40AF]"
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold text-base rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Credenciais de Teste (remover em produção) */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-3">
                🧪 Credenciais de teste:
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="bg-slate-50 p-2 rounded">
                  <strong>Admin:</strong> admin@vetric.com.br / Vetric@2026
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <strong>Cliente:</strong> granmarine@vetric.com.br / GranMarine@2026
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 VETRIC Energy Management
        </p>
      </div>
    </div>
  );
}

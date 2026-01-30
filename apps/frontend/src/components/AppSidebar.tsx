import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Users, 
  User, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  FileBarChart
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CLIENTE'] },
  { title: 'Relatórios', path: '/relatorios', icon: FileText, roles: ['ADMIN', 'CLIENTE'] },
  { title: 'Consumo', path: '/consumo', icon: BarChart3, roles: ['ADMIN', 'CLIENTE'] },
  { title: 'Relatórios VETRIC', path: '/relatorios-vetric', icon: FileBarChart, roles: ['ADMIN'] },
  { title: 'Usuários', path: '/usuarios', icon: Users, roles: ['ADMIN'] },
  { title: 'Configurações', path: '/configuracoes', icon: Settings, roles: ['ADMIN'] },
  { title: 'Perfil', path: '/perfil', icon: User, roles: ['ADMIN', 'CLIENTE'] },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Filtrar menu por role do usuário
  const visibleMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          'fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm transition-opacity lg:hidden',
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col bg-sidebar transition-all duration-300',
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64',
          className
        )}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-center border-b border-sidebar-border/50 px-4 relative z-10 bg-sidebar">
          {!collapsed && (
            <img 
              src="/vetric_marca_v1_n-300x103.webp" 
              alt="Vetric" 
              className="h-12 w-auto mx-auto"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent absolute right-4"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn(
              'h-4 w-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )} />
          </Button>
        </div>

        {/* Info do Sistema */}
        {user && !collapsed && (
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide">
              {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </p>
            <p className="mt-1 text-sm font-semibold text-sidebar-foreground truncate">
              {user.nome}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {visibleMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground shadow-md"
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        {user && (
          <div className="border-t border-sidebar-border p-3">
            {!collapsed && (
              <div className="mb-3 rounded-lg bg-sidebar-accent/50 p-3">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.nome}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 hover:bg-destructive/20 hover:text-destructive',
                collapsed && 'justify-center px-2'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>
        )}
      </aside>

      {/* Spacer for content */}
      <div className={cn(
        'hidden lg:block transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )} />
    </>
  );
}

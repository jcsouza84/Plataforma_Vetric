import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Relatorios from "./pages/Relatorios";
import RelatorioDetalhes from "./pages/RelatorioDetalhes";
import Consumo from "./pages/Consumo";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import MonitorTerminal from "./pages/MonitorTerminal";
import NotFound from "./pages/NotFound";

// 🆕 VETRIC Reports V2
import { EmpreendimentosRelatorios } from "./pages/relatorios-vetric/EmpreendimentosRelatorios";
import { NovoEmpreendimento } from "./pages/relatorios-vetric/NovoEmpreendimento";
import { DashboardEmpreendimento } from "./pages/relatorios-vetric/DashboardEmpreendimento";
import { UploadRelatorio } from "./pages/relatorios-vetric/UploadRelatorio";
import { ListaRelatorios } from "./pages/relatorios-vetric/ListaRelatorios";
import { VisualizarRelatorio } from "./pages/relatorios-vetric/VisualizarRelatorio";
import UsuariosRelatorio from "./pages/relatorios-vetric/UsuariosRelatorio";
import ConfiguracoesRelatorio from "./pages/relatorios-vetric/ConfiguracoesRelatorio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rotas Protegidas */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/relatorios" element={
              <PrivateRoute>
                <Relatorios />
              </PrivateRoute>
            } />
            <Route path="/relatorios/:id" element={
              <PrivateRoute>
                <RelatorioDetalhes />
              </PrivateRoute>
            } />
            <Route path="/consumo" element={
              <PrivateRoute>
                <Consumo />
              </PrivateRoute>
            } />
            <Route path="/usuarios" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <Usuarios />
              </PrivateRoute>
            } />
            <Route path="/configuracoes" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <Configuracoes />
              </PrivateRoute>
            } />
            <Route path="/logs" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <MonitorTerminal />
              </PrivateRoute>
            } />
            <Route path="/perfil" element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            } />

            {/* 🆕 VETRIC Reports V2 - Módulo de Relatórios */}
            <Route path="/relatorios-vetric" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <EmpreendimentosRelatorios />
              </PrivateRoute>
            } />
            <Route path="/relatorios-vetric/novo" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <NovoEmpreendimento />
              </PrivateRoute>
            } />
            <Route path="/relatorios-vetric/:id" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <DashboardEmpreendimento />
              </PrivateRoute>
            } />
            <Route path="/relatorios-vetric/:id/upload" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <UploadRelatorio />
              </PrivateRoute>
            } />
            <Route path="/relatorios-vetric/:id/relatorios" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <ListaRelatorios />
              </PrivateRoute>
            } />
            <Route path="/relatorios-vetric/:id/relatorios/:relatorioId" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <VisualizarRelatorio />
              </PrivateRoute>
            } />
            <Route path="/relatorios-vetric/:empreendimentoId/usuarios" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <UsuariosRelatorio />
              </PrivateRoute>
            } />
            <Route path="/relatorios-vetric/:empreendimentoId/configuracoes" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <ConfiguracoesRelatorio />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

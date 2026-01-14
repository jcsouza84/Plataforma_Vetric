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
import NotFound from "./pages/NotFound";

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
            <Route path="/perfil" element={
              <PrivateRoute>
                <Perfil />
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

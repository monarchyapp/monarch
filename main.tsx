import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/appStore";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Tokens from "./pages/Tokens";
import TokenDetail from "./pages/TokenDetail";
import NFTs from "./pages/NFTs";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Coach from "./pages/Coach";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();
  const { activeWalletAddress, setActiveWalletAddress } = useAppStore();
  const location = useLocation();

  // Clear invalid persisted wallet addresses
  const validWallet = activeWalletAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(activeWalletAddress)
    ? activeWalletAddress
    : null;

  if (activeWalletAddress && !validWallet) {
    setActiveWalletAddress(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full monarch-gradient animate-pulse" />
      </div>
    );
  }

  // Landing page has its own layout
  if (location.pathname === "/") {
    return <Landing />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/tokens" element={<Tokens />} />
        <Route path="/tokens/:mint" element={<TokenDetail />} />
        <Route path="/nfts" element={<NFTs />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/learn" element={<Analytics />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

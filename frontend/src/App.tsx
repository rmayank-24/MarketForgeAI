// FILE: src/App.tsx
// PURPOSE: Adds the new routes for the history pages.

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import HistoryPage from "./pages/HistoryPage"; // NEW
import HistoryDetailPage from "./pages/HistoryDetailPage"; // NEW
import { useAppStore } from "./state/store";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { token } = useAppStore();
  if (!token) {
    return <Navigate to="/auth" />;
  }
  return children;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              
              {/* NEW: History Routes */}
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/history/:kitId" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

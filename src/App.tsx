import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Payments from "./pages/Payments.tsx";
import Savings from "./pages/Savings.tsx";
import Statements from "./pages/Statements.tsx";
import Security from "./pages/Security.tsx";
import Rewards from "./pages/Rewards.tsx";
import Teacher from "./pages/Teacher.tsx";
import TaxChallenge from "./pages/TaxChallenge.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/statements" element={<Statements />} />
          <Route path="/security" element={<Security />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/tax-challenge" element={<TaxChallenge />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

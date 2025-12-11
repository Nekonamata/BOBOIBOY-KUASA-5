import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Ruangan from "./pages/Ruangan";
import Tentang from "./pages/Tentang";
import MasterGedung from "./pages/master/MasterGedung";
import MasterLantai from "./pages/master/MasterLantai";
import MasterRuangan from "./pages/master/MasterRuangan";
import LaporanPeminjaman from "./pages/laporan/LaporanPeminjaman";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ruangan" element={<Ruangan />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/master/gedung" element={<MasterGedung />} />
          <Route path="/master/lantai" element={<MasterLantai />} />
          <Route path="/master/ruangan" element={<MasterRuangan />} />
          <Route path="/laporan" element={<LaporanPeminjaman />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

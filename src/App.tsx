// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Ruangan from "./pages/Ruangan";
import Tentang from "./pages/Tentang";
import Profil from "./pages/Profil";
import MasterGedung from "./pages/master/MasterGedung";
import MasterRuangan from "./pages/master/MasterRuangan";
import LaporanPeminjaman from "./pages/laporan/LaporanPeminjaman";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import "./App.css";

const queryClient = new QueryClient();



const App = () => {
  useEffect(() => {
    console.log('🚀 App mounted');
    
    // Cleanup function
    return () => {
      console.log('🔄 App unmounting');
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ruangan" element={<Ruangan />} />
            <Route path="/tentang" element={<Tentang />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/master/gedung" element={<MasterGedung />} />
            <Route path="/master/ruangan" element={<MasterRuangan />} />
            <Route path="/laporan" element={<LaporanPeminjaman />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
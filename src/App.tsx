// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Ruangan from "./pages/Ruangan";
import Tentang from "./pages/Tentang";
import Profil from "./pages/Profil";
import MasterGedung from "./pages/master/MasterGedung";
import MasterLantai from "./pages/master/MasterLantai";
import MasterRuangan from "./pages/master/MasterRuangan";
import LaporanPeminjaman from "./pages/laporan/LaporanPeminjaman";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import "./App.css";

const queryClient = new QueryClient();

// Component untuk cek duplicate navbar
const NavbarChecker = () => {
  const location = useLocation();

  useEffect(() => {
    // Cek setiap kali route berubah
    console.log(`📍 Route changed to: ${location.pathname}`);
    
    // Cek duplicate navbar setelah route change
    setTimeout(() => {
      const navs = document.querySelectorAll('nav');
      if (navs.length > 1) {
        console.error(`❌ Found ${navs.length} navbars on route: ${location.pathname}`);
        
        // Hapus semua kecuali yang pertama
        for (let i = 1; i < navs.length; i++) {
          if (navs[i].isConnected) {
            console.log(`Removing duplicate navbar #${i}`);
            navs[i].remove();
          }
        }
      }
    }, 50);
  }, [location.pathname]);

  return null;
};

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
          <NavbarChecker />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ruangan" element={<Ruangan />} />
            <Route path="/tentang" element={<Tentang />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/master/gedung" element={<MasterGedung />} />
            <Route path="/master/lantai" element={<MasterLantai />} />
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
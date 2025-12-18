// src/hooks/usePreventDuplicateNavbar.ts
import { useEffect } from 'react';

export const usePreventDuplicateNavbar = () => {
  useEffect(() => {
    const checkAndCleanDuplicates = () => {
      // Cari semua elemen nav
      const navs = document.querySelectorAll('nav');
      
      if (navs.length > 1) {
        console.warn(`⚠️ Found ${navs.length} navbars. Removing duplicates...`);
        
        // Simpan navbar pertama (yang benar)
        const mainNav = navs[0];
        
        // Hapus semua navbar kecuali yang pertama
        for (let i = 1; i < navs.length; i++) {
          // Pastikan tidak menghapus navbar yang sedang aktif
          if (navs[i] !== mainNav && navs[i].isConnected) {
            console.log(`Removing duplicate navbar #${i}`);
            navs[i].remove();
          }
        }
      }
      
      // Cek juga duplicate header atau element dengan class navbar
      const headers = document.querySelectorAll('header');
      if (headers.length > 1) {
        console.warn(`⚠️ Found ${headers.length} headers. Cleaning...`);
        for (let i = 1; i < headers.length; i++) {
          if (headers[i].isConnected) {
            headers[i].remove();
          }
        }
      }
    };
    
    // Jalankan segera
    checkAndCleanDuplicates();
    
    // Jalankan lagi setelah DOM selesai update
    const observer = new MutationObserver(checkAndCleanDuplicates);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Jalankan secara periodic juga
    const interval = setInterval(checkAndCleanDuplicates, 1000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);
};
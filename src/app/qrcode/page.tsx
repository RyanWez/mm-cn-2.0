"use client";

import { useState, useTransition, useEffect } from "react";
import { QRCodeGenerator } from "@/components/app/qr-code/QRCodeGenerator";
import { Sidebar } from "@/components/app/sidebar";
import { Header } from "@/components/app/header";
import { PageTransition } from "@/components/app/PageTransition";
import { useRouter } from "next/navigation";
import { getSidebarCollapsed, setSidebarCollapsed } from "@/lib/storage";

export default function QRCodePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Restore sidebar state from localStorage on mount
  useEffect(() => {
    const savedCollapsed = getSidebarCollapsed();
    setIsSidebarCollapsed(savedCollapsed);
  }, []);

  const handleTranslateClick = () => {
    startTransition(() => {
      router.push("/translate");
    });
  };

  const handleQRCodeClick = () => {
    // Already on qrcode page, do nothing
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    setSidebarCollapsed(collapsed);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        onTranslateClick={handleTranslateClick}
        onQRCodeClick={handleQRCodeClick}
        currentMode="qrcode"
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />
      
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <Header 
          isCollapsed={isSidebarCollapsed} 
          onToggle={handleSidebarToggle}
          onMobileMenuToggle={handleMobileMenuToggle}
          mode="qrcode"
        />
        
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <PageTransition mode="qrcode">
            <div className="max-w-6xl mx-auto">
              <div className="mb-4 sm:mb-6 text-center">
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                  Generate QR codes for URLs, text, or any data.
                </p>
              </div>
              <QRCodeGenerator />
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

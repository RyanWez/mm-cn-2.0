"use client";

import { useState } from "react";
import { Translator } from "@/components/app/translator";
import { QRCodeGenerator } from "@/components/app/qr-code/QRCodeGenerator";
import { Sidebar } from "@/components/app/sidebar";
import { Header } from "@/components/app/header";
import { TranslationHistory } from "@/components/app/translator/TranslationHistory";
import { useTranslator } from "@/hooks/use-translator";

type AppMode = "translate" | "qrcode";

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>("translate");
  
  // Get translator state for history
  const { uid, historyRefreshTrigger, handleSelectFromHistory } = useTranslator();

  const handleTranslateClick = () => {
    setCurrentMode("translate");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQRCodeClick = () => {
    setCurrentMode("qrcode");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop fixed, Mobile drawer */}
      <Sidebar
        onTranslateClick={handleTranslateClick}
        onQRCodeClick={handleQRCodeClick}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />
      
      {/* Main Content Area - Responsive margins */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        // No margin on mobile, dynamic margin on desktop
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <Header 
          isCollapsed={isSidebarCollapsed} 
          onToggle={handleSidebarToggle}
          onMobileMenuToggle={handleMobileMenuToggle}
          rightContent={
            currentMode === "translate" ? (
              <TranslationHistory
                uid={uid}
                onSelectTranslation={handleSelectFromHistory}
                refreshTrigger={historyRefreshTrigger}
              />
            ) : null
          }
        />
        
        {/* Body - Responsive padding */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {currentMode === "translate" && (
              <>
                <div className="mb-4 sm:mb-6 text-center">
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                    AI-powered translation for customer service chats.
                  </p>
                </div>
                <Translator />
              </>
            )}
            
            {currentMode === "qrcode" && (
              <>
                <div className="mb-4 sm:mb-6 text-center">
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                    Generate QR codes for URLs, text, or any data.
                  </p>
                </div>
                <QRCodeGenerator />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

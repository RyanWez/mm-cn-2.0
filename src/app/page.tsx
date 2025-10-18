"use client";

import { useState } from "react";
import { Translator } from "@/components/app/translator";
import { Sidebar } from "@/components/app/sidebar";
import { Header } from "@/components/app/header";
import { CategoryPhrases } from "@/components/app/category-phrases";
import { TranslationHistory } from "@/components/app/translator/TranslationHistory";
import { useTranslator } from "@/hooks/use-translator";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Get translator state for history
  const { uid, historyRefreshTrigger, handleSelectFromHistory } = useTranslator();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDashboardClick = () => {
    setSelectedCategory(null);
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Left Sidebar */}
      <Sidebar
        onCategorySelect={handleCategorySelect}
        onDashboardClick={handleDashboardClick}
        selectedCategory={selectedCategory}
        isCollapsed={isSidebarCollapsed}
      />
      
      {/* Right Content Area with dynamic margin for fixed sidebar */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <Header 
          isCollapsed={isSidebarCollapsed} 
          onToggle={handleSidebarToggle}
          rightContent={
            <TranslationHistory
              uid={uid}
              onSelectTranslation={handleSelectFromHistory}
              refreshTrigger={historyRefreshTrigger}
            />
          }
        />
        
        {/* Body */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {selectedCategory ? (
              <CategoryPhrases selectedCategory={selectedCategory} />
            ) : (
              <>
                <div className="mb-6 text-center">
                  <p className="text-lg text-muted-foreground">
                    AI-powered translation for customer service chats.
                  </p>
                </div>
                <Translator />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

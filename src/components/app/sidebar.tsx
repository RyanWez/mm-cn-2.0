"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LayoutDashboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { commonPhrasesData } from "@/lib/data";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SidebarProps {
  onCategorySelect: (category: string) => void;
  onDashboardClick: () => void;
  selectedCategory: string | null;
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

// Map categories to their corresponding SVG icons
const categoryIcons: { [key: string]: string } = {
  "Most use (常用)": "/icons/most-use.svg",
  "ငွေသွင်း (充值)": "/icons/deposit.svg",
  'ငွေထုတ် (提款)': "/icons/withdrawl.svg",
  "စောင့်ဆိုင်း (等待)": "/icons/waiting.svg",
  "အော်ဒါတင်နည်း (如何下单)": "/icons/order.svg",
  "ဂိမ်းရှုံး (游戏输了)": "/icons/game-lost.svg",
  'ငွေမှားလွှဲ (转错账)': "/icons/wrong-trasfer.svg",
  "အကောင့် ချိတ်ဆက်နည်း": "/icons/connect-acc.svg",
  "အကောင့်ပြောင်း(更换账户)": "/icons/change-acc.svg",
};

export function Sidebar({ 
  onCategorySelect, 
  onDashboardClick, 
  selectedCategory, 
  isCollapsed,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const [isCommonPhrasesOpen, setIsCommonPhrasesOpen] = useState(false);

  const handleCategoryClick = (category: string) => {
    onCategorySelect(category);
    onMobileClose?.(); // Close mobile drawer after selection
  };

  const handleDashboardClick = () => {
    onDashboardClick();
    onMobileClose?.(); // Close mobile drawer after selection
  };

  // Sidebar content component (reusable for both desktop and mobile)
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#F2F5F8]">
      {/* Header with Logo */}
      <div className="h-16 border-b border-border flex items-center px-4 overflow-hidden">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 w-full">
            <Image
              src="/icons/Logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 icon-hover flex-shrink-0"
            />
            <span className="font-semibold text-foreground whitespace-nowrap transition-all duration-500 ease-out opacity-100 transform translate-x-0">
              Myanmar-Chinese
            </span>
          </div>
        ) : (
          <div className="flex justify-center w-full transition-all duration-300">
            <Image
              src="/icons/Logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 icon-hover"
            />
          </div>
        )}
      </div>

      {/* Dashboard */}
      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full font-semibold smooth-transition",
            isCollapsed ? "justify-center px-2" : "justify-start gap-3",
            !selectedCategory && "bg-accent"
          )}
          onClick={handleDashboardClick}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="transition-all duration-500 ease-out opacity-100 transform translate-x-0 whitespace-nowrap">
              Dashboard
            </span>
          )}
        </Button>
      </div>

      {/* Common Phrases Dropdown */}
      {!isCollapsed && (
        <div className="px-4 flex-1 overflow-y-auto">
          <Button
            variant="ghost"
            className="w-full justify-between text-left font-semibold hover:bg-accent"
            onClick={() => setIsCommonPhrasesOpen(!isCommonPhrasesOpen)}
          >
            <span className="transition-all duration-500 ease-out opacity-100 transform translate-x-0 whitespace-nowrap">
              Common Phrases
            </span>
            {isCommonPhrasesOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          {isCommonPhrasesOpen && (
            <div className="mt-2 pl-4 space-y-1 no-scrollbar">
              {commonPhrasesData.map((category) => (
                <Button
                  key={category.category}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left text-sm hover:bg-accent smooth-transition gap-3",
                    selectedCategory === category.category && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleCategoryClick(category.category)}
                >
                  {categoryIcons[category.category] && (
                    <Image
                      src={categoryIcons[category.category]}
                      alt={category.category}
                      width={16}
                      height={16}
                      className="w-4 h-4 flex-shrink-0 icon-hover"
                    />
                  )}
                  <span className="truncate transition-all duration-500 ease-out opacity-100 transform translate-x-0">
                    {category.category}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapsed State - Show only icons */}
      {isCollapsed && (
        <div className="px-2 space-y-2 mt-4 flex-1 overflow-y-auto">
          {commonPhrasesData.map((category) => (
            <Button
              key={category.category}
              variant="ghost"
              size="icon"
              className={cn(
                "w-full h-12 hover:bg-accent smooth-transition rounded-lg",
                selectedCategory === category.category && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleCategoryClick(category.category)}
              title={category.category}
            >
              {categoryIcons[category.category] ? (
                <Image
                  src={categoryIcons[category.category]}
                  alt={category.category}
                  width={20}
                  height={20}
                  className="w-5 h-5 icon-hover"
                />
              ) : (
                <span className="text-xs font-bold">
                  {category.category.charAt(0)}
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={cn(
        "hidden lg:block fixed left-0 top-0 h-screen bg-[#F2F5F8] border-r border-border smooth-transition z-40 shadow-lg",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Sheet Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0 bg-[#F2F5F8]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
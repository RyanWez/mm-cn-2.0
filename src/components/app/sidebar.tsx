"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { commonPhrasesData } from "@/lib/data";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SidebarProps {
  onCategorySelect: (category: string) => void;
  onDashboardClick: () => void;
  selectedCategory: string | null;
  onToggle: (collapsed: boolean) => void;
}

// Map categories to their corresponding SVG icons
const categoryIcons: { [key: string]: string } = {
  "Most use (常用)": "/icons/most-use.svg",
  "ငွေသွင်း (充值)": "/icons/deposit.svg",
  "ငွေထုတ် (提款)": "/icons/withdrawl.svg",
  "စောင့်ဆိုင်း (等待)": "/icons/waiting.svg",
  "အော်ဒါတင်နည်း (如何下单)": "/icons/order.svg",
  "ဂိမ်းရှုံး (游戏输了)": "/icons/game-lost.svg",
  "ငွေမှားလွှဲ (转错账)": "/icons/wrong-trasfer.svg",
  "အကောင့် ချိတ်ဆက်နည်း": "/icons/connect-acc.svg",
  "အကောင့်ပြောင်း(更换账户)": "/icons/change-acc.svg",
};

export function Sidebar({ onCategorySelect, onDashboardClick, selectedCategory, onToggle }: SidebarProps) {
  const [isCommonPhrasesOpen, setIsCommonPhrasesOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle(newCollapsed);
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-[#F2F5F8] border-r border-border flex flex-col smooth-transition z-40",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header with Logo and Menu Toggle */}
      <div className="h-16 border-b border-border flex items-center px-4">
        {!isCollapsed ? (
          /* Expanded State - Logo + Close Button */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/Logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 icon-hover"
              />
              <span className="font-semibold text-foreground">Myanmar-Chinese</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          /* Collapsed State - Only Menu Button */
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="w-full justify-center hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Dashboard */}
      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full font-semibold smooth-transition",
            isCollapsed ? "justify-center px-2" : "justify-start gap-2",
            !selectedCategory && "bg-accent"
          )}
          onClick={onDashboardClick}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </Button>
      </div>

      {/* Common Phrases Dropdown */}
      {!isCollapsed && (
        <div className="px-4">
          <Button
            variant="ghost"
            className="w-full justify-between text-left font-semibold hover:bg-accent"
            onClick={() => setIsCommonPhrasesOpen(!isCommonPhrasesOpen)}
          >
            <span>Common Phrases</span>
            {isCommonPhrasesOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          {isCommonPhrasesOpen && (
            <div className="mt-2 pl-4 space-y-1 no-scrollbar h-full overflow-y-auto">
              {commonPhrasesData.map((category) => (
                <Button
                  key={category.category}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left text-sm hover:bg-accent smooth-transition gap-2",
                    selectedCategory === category.category && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onCategorySelect(category.category)}
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
                  <span className="truncate">{category.category}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapsed State - Show only icons */}
      {isCollapsed && (
        <div className="px-2 space-y-2">
          {commonPhrasesData.map((category) => (
            <Button
              key={category.category}
              variant="ghost"
              size="icon"
              className={cn(
                "w-full h-12 hover:bg-accent smooth-transition",
                selectedCategory === category.category && "bg-accent text-accent-foreground"
              )}
              onClick={() => onCategorySelect(category.category)}
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
}
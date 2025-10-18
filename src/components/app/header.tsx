"use client";

import { Languages, Menu, X, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { ReactNode } from "react";

interface HeaderProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  rightContent?: ReactNode;
}

export function Header({ isCollapsed, onToggle, rightContent }: HeaderProps) {
  return (
    <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 flex items-center justify-between px-6 sticky top-0 z-50 smooth-transition">
      <div className="flex items-center gap-3">
        {/* Professional Toggle Icon - Changes based on state */}
        <button
          onClick={() => onToggle(!isCollapsed)}
          className="p-2 rounded-md hover:bg-accent border border-border/40 transition-all duration-300 shadow-sm bg-background/50 hover:shadow-md"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-foreground transition-all duration-300" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-foreground transition-all duration-300" />
          )}
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Languages className="h-5 w-5 text-primary icon-hover" />
          <h1 className="font-headline text-lg font-bold tracking-tight text-primary">
            Myanmar-Chinese Chat Assistant
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
      </div>
    </header>
  );
}

"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SidebarProps {
  onTranslateClick: () => void;
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  onTranslateClick,
  isCollapsed,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const handleTranslateClick = () => {
    onTranslateClick();
    onMobileClose?.();
  };

  // Sidebar content component (reusable for both desktop and mobile)
  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-background/95 backdrop-blur-sm">
      {/* Header with Logo */}
      <div className="flex h-16 items-center overflow-hidden border-b border-border px-4">
        {!isCollapsed ? (
          <div className="flex w-full items-center gap-3">
            <Image
              src="/icons/Logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="icon-hover h-8 w-8 flex-shrink-0"
            />
            <span className="translate-x-0 transform whitespace-nowrap font-semibold text-foreground opacity-100 transition-all duration-500 ease-out">
              Myanmar-Chinese
            </span>
          </div>
        ) : (
          <div className="flex w-full justify-center transition-all duration-300">
            <Image
              src="/icons/Logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="icon-hover h-8 w-8"
            />
          </div>
        )}
      </div>

      {/* Translate Mode */}
      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "smooth-transition w-full bg-accent/80 font-semibold hover:bg-accent hover:bg-accent/50",
            isCollapsed ? "justify-center px-2" : "justify-start gap-3"
          )}
          onClick={handleTranslateClick}
        >
          <Languages className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="translate-x-0 transform whitespace-nowrap opacity-100 transition-all duration-500 ease-out">
              Translate Mode
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className={cn(
          "smooth-transition fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-background/95 shadow-lg backdrop-blur-sm lg:block",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Sheet Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 bg-background p-0 [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

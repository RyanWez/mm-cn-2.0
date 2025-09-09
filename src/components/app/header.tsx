"use client";

import { Languages } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 flex items-center justify-between px-6 sticky top-0 z-50 smooth-transition">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Languages className="h-5 w-5 text-primary icon-hover" />
          <h1 className="font-headline text-lg font-bold tracking-tight text-primary">
            Myanmar-Chinese Chat Assistant
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
      </div>
    </header>
  );
}
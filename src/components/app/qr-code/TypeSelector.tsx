"use client";

import { Link, FileText, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QRType } from "./types";

interface TypeSelectorProps {
  selectedType: QRType;
  onTypeChange: (type: QRType) => void;
}

export function TypeSelector({ selectedType, onTypeChange }: TypeSelectorProps) {
  const types = [
    { id: "url" as QRType, label: "URL", icon: Link },
    { id: "text" as QRType, label: "TEXT", icon: FileText },
    { id: "wifi" as QRType, label: "WIFI", icon: Wifi },
  ];

  return (
    <div className="flex gap-2 sm:gap-3">
      {types.map((type) => {
        const Icon = type.icon;
        const isActive = selectedType === type.id;
        
        return (
          <Button
            key={type.id}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "flex-1 flex items-center gap-1 sm:gap-2 h-10 sm:h-12 text-xs sm:text-sm",
              isActive && "bg-primary text-primary-foreground"
            )}
            onClick={() => onTypeChange(type.id)}
          >
            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="font-medium">{type.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

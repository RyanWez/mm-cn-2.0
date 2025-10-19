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
    <div className="flex gap-3">
      {types.map((type) => {
        const Icon = type.icon;
        const isActive = selectedType === type.id;
        
        return (
          <Button
            key={type.id}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "flex-1 flex items-center gap-2 h-12",
              isActive && "bg-primary text-primary-foreground"
            )}
            onClick={() => onTypeChange(type.id)}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{type.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

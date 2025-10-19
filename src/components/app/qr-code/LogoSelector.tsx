"use client";

import { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { QRLogo } from "./types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

interface LogoSelectorProps {
  selectedLogo: QRLogo;
  onLogoChange: (logo: QRLogo) => void;
}

export function LogoSelector({ selectedLogo, onLogoChange }: LogoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const logos: { id: QRLogo; label: string; path?: string }[] = [
    { id: "none", label: "None" },
    { id: "dino", label: "Dino", path: "/logo/Dino.svg" },
    { id: "wavepay", label: "Wave Pay", path: "/logo/Wave-Pay.png" },
    { id: "kbzpay", label: "KBZ Pay", path: "/logo/KBZ-Pay.webp" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            LOGO
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <Label className="text-xs text-muted-foreground">Select Logo</Label>

          <div className="grid grid-cols-4 gap-2">
            {logos.map((logo) => {
              const isActive = selectedLogo === logo.id;

              return (
                <Button
                  key={logo.id}
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "h-20 flex flex-col items-center justify-center gap-1 p-2",
                    isActive && "ring-2 ring-primary"
                  )}
                  onClick={() => onLogoChange(logo.id)}
                >
                  {logo.id === "none" ? (
                    <X className="h-6 w-6" />
                  ) : logo.path ? (
                    <div className="relative w-10 h-10">
                      <Image
                        src={logo.path}
                        alt={logo.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                  <span className="text-[10px] text-center">{logo.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Upload Custom Logo - Future Feature */}
          <Button
            variant="outline"
            className="w-full"
            disabled
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload your own (Coming soon)
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

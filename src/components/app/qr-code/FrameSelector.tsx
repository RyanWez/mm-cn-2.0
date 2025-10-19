"use client";

import { X, Square, Circle, Frame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QRFrame } from "./types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FrameSelectorProps {
  selectedFrame: QRFrame;
  onFrameChange: (frame: QRFrame) => void;
}

export function FrameSelector({ selectedFrame, onFrameChange }: FrameSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const frames: { id: QRFrame; label: string; icon: any; isNew?: boolean }[] = [
    { id: "none", label: "None", icon: X },
    { id: "basic", label: "Basic", icon: Square },
    { id: "rounded", label: "Rounded", icon: Circle, isNew: true },
    { id: "banner", label: "Banner", icon: Frame },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-cyan-500 hover:bg-cyan-600 text-white border-0"
        >
          <span className="flex items-center gap-2">
            <Frame className="h-4 w-4" />
            FRAME
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">NEW!</span>
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
        <div className="grid grid-cols-4 gap-2 p-2 bg-muted/30 rounded-lg">
          {frames.map((frame) => {
            const Icon = frame.icon;
            const isActive = selectedFrame === frame.id;

            return (
              <Button
                key={frame.id}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "h-16 flex flex-col items-center justify-center gap-1 relative",
                  isActive && "ring-2 ring-primary"
                )}
                onClick={() => onFrameChange(frame.id)}
              >
                {frame.isNew && (
                  <span className="absolute top-1 right-1 text-[8px] bg-blue-600 text-white px-1 rounded">
                    NEW
                  </span>
                )}
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{frame.label}</span>
              </Button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

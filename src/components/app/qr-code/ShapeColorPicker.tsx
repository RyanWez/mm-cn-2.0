"use client";

import { useState } from "react";
import { Square, Circle, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { QRShape } from "./types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface ShapeColorPickerProps {
  selectedShape: QRShape;
  fgColor: string;
  bgColor: string;
  onShapeChange: (shape: QRShape) => void;
  onFgColorChange: (color: string) => void;
  onBgColorChange: (color: string) => void;
}

export function ShapeColorPicker({
  selectedShape,
  fgColor,
  bgColor,
  onShapeChange,
  onFgColorChange,
  onBgColorChange,
}: ShapeColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shapes: { id: QRShape; label: string; icon: any }[] = [
    { id: "square", label: "Square", icon: Square },
    { id: "rounded", label: "Rounded", icon: Square },
    { id: "dots", label: "Dots", icon: Circle },
    { id: "extra-rounded", label: "Extra", icon: Grid3x3 },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            SHAPE & COLOR
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
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          {/* Shape Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">QR Pattern Shape</Label>
            <div className="grid grid-cols-4 gap-2">
              {shapes.map((shape) => {
                const Icon = shape.icon;
                const isActive = selectedShape === shape.id;

                return (
                  <Button
                    key={shape.id}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "h-16 flex flex-col items-center justify-center gap-1",
                      isActive && "ring-2 ring-primary"
                    )}
                    onClick={() => onShapeChange(shape.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px]">{shape.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fg-color" className="text-xs">
                Foreground
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => onFgColorChange(e.target.value)}
                  className="h-10 w-full rounded border cursor-pointer"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {fgColor}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bg-color" className="text-xs">
                Background
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  className="h-10 w-full rounded border cursor-pointer"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {bgColor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

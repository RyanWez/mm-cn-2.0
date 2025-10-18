"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";

interface TranslateButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  cooldown: number;
}

export function TranslateButton({
  onClick,
  isDisabled,
  isLoading,
  cooldown,
}: TranslateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      className="h-12 w-full text-base font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] sm:h-11 sm:text-sm"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin sm:h-4 sm:w-4" />
      ) : cooldown > 0 ? (
        <span>Try again in {cooldown}s</span>
      ) : (
        <Languages className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
      )}
      {cooldown === 0 && "Translate"}
    </Button>
  );
}

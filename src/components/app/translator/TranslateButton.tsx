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

export function TranslateButton({ onClick, isDisabled, isLoading, cooldown }: TranslateButtonProps) {
  return (
    <motion.div
      className="w-full"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Button
        onClick={onClick}
        disabled={isDisabled}
        className="w-full h-12 sm:h-11 text-base sm:text-sm font-semibold"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
        ) : cooldown > 0 ? (
          <span>Try again in {cooldown}s</span>
        ) : (
          <Languages className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
        )}
        {cooldown === 0 && "Translate"}
      </Button>
    </motion.div>
  );
}

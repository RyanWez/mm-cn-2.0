"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  textToCopy: string;
}

export function CopyButton({ textToCopy }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    // Fallback for non-secure contexts
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setIsCopied(true);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setIsCopied(true);
      },
      (err) => {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "h-8 px-3 text-xs font-medium transition-all shadow-sm",
        isCopied
          ? "bg-primary/20 text-primary hover:bg-primary/30"
          : "bg-background/80 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm"
      )}
    >
      {isCopied ? "Copied!" : "Copy"}
    </Button>
  );
}

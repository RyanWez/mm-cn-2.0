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
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "w-24 transition-all shrink-0",
        isCopied
          ? "bg-secondary text-secondary-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {isCopied ? "Copied!" : "Copy"}
    </Button>
  );
}

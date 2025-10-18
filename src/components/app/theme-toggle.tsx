"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme for immediate theme detection
  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="relative h-10 w-10 rounded-md border border-border/40 bg-background/50"
      >
        <div className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-md border border-border/40 bg-background/50 hover:bg-accent transition-all duration-300 overflow-hidden"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Sun className="h-5 w-5 text-foreground" />
        </motion.div>

        {/* Moon Icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Moon className="h-5 w-5 text-foreground" />
        </motion.div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

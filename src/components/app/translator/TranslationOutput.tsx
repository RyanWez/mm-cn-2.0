"use client";

import { CopyButton } from "../copy-button";
import { motion, AnimatePresence } from "framer-motion";

interface TranslationOutputProps {
  translation: string;
  isLoading: boolean;
  isStreaming: boolean;
  finalTranslation: string;
}

export function TranslationOutput({ 
  translation, 
  isLoading, 
  isStreaming,
  finalTranslation 
}: TranslationOutputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border bg-muted p-2 text-center font-semibold">
        Translation
      </div>
      
      <div className="relative min-h-[150px] rounded-md border bg-muted">
        <AnimatePresence mode="wait">
          {isLoading && !translation ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="thinking-container">
                <div className="thinking-icon">
                  <svg
                    className="thinking-brain"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                      fill="currentColor"
                      opacity="0.3"
                    />
                    <path
                      d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="thinking-text">
                  <span className="thinking-label">Thinking</span>
                  <span className="thinking-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="translation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative min-h-[150px] max-h-[400px] w-full"
            >
              <div className="overflow-y-auto whitespace-pre-wrap p-3 pb-12 text-base leading-relaxed h-full">
                {translation}
                {isStreaming && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block ml-1 w-2 h-4 bg-current"
                  />
                )}
              </div>
              {/* Copy button inside translation box */}
              {translation && !isLoading && !isStreaming && (
                <div className="absolute bottom-2 right-2">
                  <CopyButton textToCopy={finalTranslation} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

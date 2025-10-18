"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslator } from "@/hooks/use-translator";
import { TranslationInput } from "./translator/TranslationInput";
import { TranslationOutput } from "./translator/TranslationOutput";
import { TranslateButton } from "./translator/TranslateButton";
import { ErrorAlert } from "./translator/ErrorAlert";

export function Translator() {
  const {
    inputText,
    setInputText,
    translation,
    isLoading,
    isStreaming,
    error,
    cooldown,
    handleTranslate,
    isTranslateDisabled,
    finalTranslationRef,
    uid,
    historyRefreshTrigger,
    handleSelectFromHistory,
  } = useTranslator();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card">
        <CardHeader className="space-y-2 sm:space-y-3">
          <CardTitle className="font-headline text-2xl sm:text-3xl">
            Live Translator V2.0
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            AI-powered translation for customer service chats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <TranslationInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={1000}
            />
            <TranslationOutput
              translation={translation}
              isLoading={isLoading}
              isStreaming={isStreaming}
              finalTranslation={finalTranslationRef.current}
            />
          </div>

          <ErrorAlert message={error} />

          <TranslateButton
            onClick={handleTranslate}
            isDisabled={isTranslateDisabled}
            isLoading={isLoading}
            cooldown={cooldown}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

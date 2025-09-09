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
    error,
    cooldown,
    handleTranslate,
    isTranslateDisabled,
    finalTranslationRef,
  } = useTranslator();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            Live Translator V2.0
          </CardTitle>
          <CardDescription>
            Streaming translation with history-based caching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <TranslationInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={250}
            />
            <TranslationOutput
              translation={translation}
              isLoading={isLoading}
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
"use client";

import { useState, useEffect, useRef } from "react";
import {
  saveTranslationHistory,
  findTranslationInHistory,
  getUserId,
  checkCooldown,
  updateCooldown,
} from "@/lib/storage";
import { translateCustomerQuery } from "@/ai/translate";

const COOLDOWN_SECONDS = 15;

export function useTranslator() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const finalTranslationRef = useRef("");

  useEffect(() => {
    // Get or create user ID
    const userId = getUserId();
    setUid(userId);
    
    // Check initial cooldown
    const remaining = checkCooldown();
    if (remaining > 0) {
      setCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleTranslate = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading || cooldown > 0 || !uid) return;

    setIsLoading(true);
    setError("");
    setTranslation("");
    finalTranslationRef.current = "";

    const typeChunkWithDelay = (chunk: string) => {
      return new Promise<void>((resolve) => {
        const segmenter = new Intl.Segmenter("my", { granularity: "grapheme" });
        const graphemes = Array.from(segmenter.segment(chunk)).map(
          (s) => s.segment
        );
        let i = 0;
        function type() {
          if (i < graphemes.length) {
            const char = graphemes[i];
            setTranslation((prev) => prev + char);
            finalTranslationRef.current += char;
            i++;
            setTimeout(type, 20);
          } else {
            resolve();
          }
        }
        type();
      });
    };

    try {
      // First, check for a cached translation
      const cachedTranslation = findTranslationInHistory(trimmedInput);
      if (cachedTranslation) {
        await typeChunkWithDelay(cachedTranslation);
        return;
      }

      // If not cached, call the server
      const stream = await translateCustomerQuery({ query: trimmedInput, uid });
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let fullResponse = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const decodedChunk = decoder.decode(value, { stream: true });
        fullResponse += decodedChunk;
      }

      // Check for error message
      if (fullResponse.startsWith("Error:")) {
        const cooldownMessage = fullResponse.replace("Error: ", "");
        setError(cooldownMessage);
        const match = cooldownMessage.match(/(\d+)/);
        if (match && match[1]) {
          setCooldown(parseInt(match[1], 10));
        }
        return;
      }

      // Display translation and save to history
      await typeChunkWithDelay(fullResponse);
      saveTranslationHistory(trimmedInput, finalTranslationRef.current);
      updateCooldown();
      setHistoryRefreshTrigger(prev => prev + 1);
      setCooldown(COOLDOWN_SECONDS);
    } catch (e: any) {
      setError("Failed to get translation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isTranslateDisabled = isLoading || !inputText.trim() || cooldown > 0;

  const handleSelectFromHistory = (original: string, translated: string) => {
    setInputText(original);
    setTranslation(translated);
    finalTranslationRef.current = translated;
  };

  return {
    inputText,
    setInputText,
    translation,
    isLoading,
    error,
    cooldown,
    handleTranslate,
    isTranslateDisabled,
    finalTranslationRef,
    uid,
    historyRefreshTrigger,
    handleSelectFromHistory,
  };
}

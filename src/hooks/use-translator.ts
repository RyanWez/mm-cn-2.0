"use client";

import { useState, useEffect, useRef } from "react";
import { getAnonymousUser } from "@/lib/auth";
import {
  saveTranslationHistory,
  findTranslationInHistory,
} from "@/lib/database";
import { translateCustomerQuery } from "@/ai/translate";

const COOLDOWN_SECONDS = 15;

export function useTranslator() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const finalTranslationRef = useRef("");

  useEffect(() => {
    getAnonymousUser()
      .then((user) => setUid(user.uid))
      .catch((e) => {
        console.error("Failed to get anonymous user:", e);
        setError("Could not initialize user session. Please refresh the page.");
      });
  }, []);

  useEffect(() => {
    const cooldownEndTime = localStorage.getItem("cooldownEndTime");
    if (cooldownEndTime) {
      const remainingTime = Math.ceil(
        (parseInt(cooldownEndTime) - Date.now()) / 1000
      );
      if (remainingTime > 0) setCooldown(remainingTime);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem("cooldownEndTime");
      return;
    }
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
      const cachedTranslation = await findTranslationInHistory(
        uid,
        trimmedInput
      );
      if (cachedTranslation) {
        await typeChunkWithDelay(cachedTranslation);
      } else {
        const stream = await translateCustomerQuery({ query: trimmedInput });
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const decodedChunk = decoder.decode(value, { stream: true });
          await typeChunkWithDelay(decodedChunk);
        }

        await saveTranslationHistory(
          uid,
          trimmedInput,
          finalTranslationRef.current
        );
        const endTime = Date.now() + COOLDOWN_SECONDS * 1000;
        localStorage.setItem("cooldownEndTime", endTime.toString());
        setCooldown(COOLDOWN_SECONDS);
      }
    } catch (e) {
      setError("Failed to get translation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isTranslateDisabled = isLoading || !inputText.trim() || cooldown > 0;

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
  };
}
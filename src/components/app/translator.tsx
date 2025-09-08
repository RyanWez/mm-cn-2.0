'use client';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Languages, AlertCircle } from "lucide-react";
import { LottieLoader } from "./lottie-loader";
import { CopyButton } from "./copy-button";
import { translateCustomerQuery } from "@/ai/translate";
import { getAnonymousUser } from "@/lib/auth";
import { saveTranslationHistory, findTranslationInHistory } from "@/lib/database";

const COOLDOWN_SECONDS = 15;
const MotionButton = motion(Button);

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const finalTranslationRef = useRef("");

  useEffect(() => {
    getAnonymousUser()
      .then(user => setUid(user.uid))
      .catch(e => {
        console.error("Failed to get anonymous user:", e);
        setError("Could not initialize user session. Please refresh the page.");
      });
  }, []);

  useEffect(() => {
    const cooldownEndTime = localStorage.getItem('cooldownEndTime');
    if (cooldownEndTime) {
      const remainingTime = Math.ceil((parseInt(cooldownEndTime) - Date.now()) / 1000);
      if (remainingTime > 0) setCooldown(remainingTime);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem('cooldownEndTime');
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
      return new Promise<void>(resolve => {
        const segmenter = new Intl.Segmenter('my', { granularity: 'grapheme' });
        const graphemes = Array.from(segmenter.segment(chunk)).map(s => s.segment);
        let i = 0;
        function type() {
          if (i < graphemes.length) {
            const char = graphemes[i];
            setTranslation(prev => prev + char);
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
      const cachedTranslation = await findTranslationInHistory(uid, trimmedInput);
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

        await saveTranslationHistory(uid, trimmedInput, finalTranslationRef.current);
        const endTime = Date.now() + COOLDOWN_SECONDS * 1000;
        localStorage.setItem('cooldownEndTime', endTime.toString());
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Live Translator V2.1</CardTitle>
          <CardDescription>Streaming translation with history-based caching.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-center font-semibold p-2 rounded-md border bg-muted">Enter Burmese or Chinese</div>
              <Textarea
                id="input-text"
                placeholder="ဘာသာပြန်ရန် စာသားရိုက်ထည့်ပါ"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                rows={6}
                className="text-base bg-transparent"
                maxLength={250}
              />
              <p className="text-xs text-muted-foreground text-right pr-1">{inputText.length} / 250</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-center font-semibold p-2 rounded-md border bg-muted">Translation</div>
              {isLoading && !translation ? (
                <div className="flex items-center justify-center rounded-md bg-muted border h-[110px]">
                  <LottieLoader />
                </div>
              ) : (
                <div className="w-full rounded-md bg-muted p-3 text-base h-[110px] overflow-hidden leading-relaxed whitespace-pre-wrap">
                  {translation}
                </div>
              )}
              <div className="h-6 text-right">
                {translation && !isLoading && <CopyButton textToCopy={finalTranslationRef.current} />}
              </div>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <MotionButton
            onClick={handleTranslate}
            disabled={isTranslateDisabled}
            className="w-full"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : cooldown > 0 ? <span>Try again in {cooldown}s</span> : <Languages className="mr-2 h-4 w-4" />}
            {cooldown === 0 && 'Translate'}
          </MotionButton>
        </CardContent>
      </Card>
    </motion.div>
  );
}
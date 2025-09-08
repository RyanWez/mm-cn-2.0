"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";
import { translateCustomerQuery } from "@/ai/translate";
import { CopyButton } from "./copy-button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { LottieLoader } from "./lottie-loader";
import { getAnonymousUser } from "@/lib/auth";
import { saveTranslationHistory, findTranslationInHistory } from "@/lib/database";

const COOLDOWN_SECONDS = 15;

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [uid, setUid] = useState<string | null>(null);

  // Effect to get anonymous user UID on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getAnonymousUser();
        setUid(user.uid);
      } catch (e) {
        console.error("Failed to get anonymous user:", e);
        setError("Could not initialize user session. Please refresh the page.");
      }
    };
    fetchUser();
  }, []);

  // Effect to initialize and manage the cooldown timer
  useEffect(() => {
    // Check for an existing cooldown in localStorage on initial load
    const cooldownEndTime = localStorage.getItem('cooldownEndTime');
    if (cooldownEndTime) {
      const remainingTime = Math.ceil((parseInt(cooldownEndTime) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setCooldown(remainingTime);
      }
    }
  }, []); // This effect runs only once on mount to initialize

  useEffect(() => {
    // This effect handles the countdown logic
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } else {
      // Clean up localStorage when cooldown finishes
      localStorage.removeItem('cooldownEndTime');
    }
    return () => clearTimeout(timer);
  }, [cooldown]);


  const handleTranslate = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || cooldown > 0 || !uid) {
        if (!uid) {
            setError("User session not ready. Please wait a moment and try again.");
        }
        return;
    }

    setIsLoading(true);
    setError("");
    setTranslation("");

    try {
      const cachedTranslation = await findTranslationInHistory(uid, trimmedInput);

      if (cachedTranslation) {
        setTranslation(cachedTranslation);
      } else {
        const translationResult = await translateCustomerQuery({
          query: trimmedInput,
        });

        if (translationResult) {
          setTranslation(translationResult);
          await saveTranslationHistory(uid, trimmedInput, translationResult);
          
          // Set cooldown state and save the end time to localStorage
          const endTime = Date.now() + COOLDOWN_SECONDS * 1000;
          localStorage.setItem('cooldownEndTime', endTime.toString());
          setCooldown(COOLDOWN_SECONDS); // This will trigger the countdown effect
        }
      }
    } catch (e) {
      setError("Failed to get translation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isTranslateDisabled = isLoading || !inputText.trim() || cooldown > 0;
  const placeholder = "ဘာသာပြန်ရန် စာသားရိုက်ထည့်ပါ";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Live Translator
        </CardTitle>
        <CardDescription>
          Enter text to automatically detect the language and translate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
          {/* Source Language Column */}
          <div className="flex flex-col gap-2">
            <div className="text-center font-semibold text-card-foreground p-2 rounded-md border bg-muted">
              Enter Burmese or Chinese
            </div>
            <Textarea
              id="input-text"
              name="input-text"
              placeholder={placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="text-base"
              maxLength={250}
            />
            <p className="text-xs text-muted-foreground text-right pr-1">
              {inputText.length} / 250
            </p>
          </div>

          {/* Target Language Column */}
          <div className="flex flex-col gap-2 md:pt-0">
             <div className="text-center font-semibold text-card-foreground p-2 rounded-md border bg-muted">
              Translation
            </div>
            <div className="relative w-full">
              {isLoading ? (
                <div className="flex items-center justify-center rounded-md bg-muted border h-[110px]">
                  <LottieLoader />
                </div>
              ) : (
                <Textarea
                  id="translation-output"
                  name="translation-output"
                  placeholder=""
                  value={translation}
                  readOnly
                  rows={6}
                  className="text-base bg-muted"
                />
              )}
              {translation && !isLoading && (
                 <div className="absolute bottom-2 right-2">
                   <CopyButton textToCopy={translation} />
                 </div>
              )}
            </div>
             <p className="text-xs text-muted-foreground text-right pr-1 h-4"></p> {/* Spacer */}
          </div>
        </div>

        {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        <Button onClick={handleTranslate} disabled={isTranslateDisabled} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : cooldown > 0 ? (
            <span>Try again in {cooldown}s</span>
          ) : (
            <Languages className="mr-2 h-4 w-4" />
          )}
          {cooldown === 0 && 'Translate'}
        </Button>
         <p className="text-xs text-muted-foreground pt-2 text-center opacity-70">
            AI နဲ့ ဘာသာပြန်ထားတာဖြစ်လို့ အဓိပ္ပာယ် အနည်းငယ် ကွဲလွဲမှု ရှိနိုင်ပါသည်
          </p>
      </CardContent>
    </Card>
  );
}

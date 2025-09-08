"use client";

import { LottieLoader } from "../lottie-loader";
import { CopyButton } from "../copy-button";

interface TranslationOutputProps {
  translation: string;
  isLoading: boolean;
  finalTranslation: string;
}

export function TranslationOutput({ translation, isLoading, finalTranslation }: TranslationOutputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border bg-muted p-2 text-center font-semibold">
        Translation
      </div>
      {isLoading && !translation ? (
        <div className="flex h-[110px] items-center justify-center rounded-md border bg-muted">
          <LottieLoader />
        </div>
      ) : (
        <div className="h-[110px] w-full overflow-hidden whitespace-pre-wrap rounded-md bg-muted p-3 text-base leading-relaxed">
          {translation}
        </div>
      )}
      <div className="h-6 text-right">
        {translation && !isLoading && (
          <CopyButton textToCopy={finalTranslation} />
        )}
      </div>
    </div>
  );
}

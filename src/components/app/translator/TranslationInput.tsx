"use client";

import { Textarea } from "@/components/ui/textarea";

interface TranslationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
}

export function TranslationInput({ value, onChange, maxLength }: TranslationInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border bg-muted p-2 text-center font-semibold">
        Enter Burmese or Chinese
      </div>
      <Textarea
        id="input-text"
        placeholder="ဘာသာပြန်ရန် စာသားရိုက်ထည့်ပါ"
        value={value}
        onChange={onChange}
        rows={6}
        className="bg-transparent text-base"
        maxLength={maxLength}
      />
      <p className="pr-1 text-right text-xs text-muted-foreground">
        {value.length} / {maxLength}
      </p>
    </div>
  );
}

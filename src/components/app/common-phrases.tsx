"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { commonPhrasesData } from "@/lib/data";
import { CopyButton } from "./copy-button";
import { Card } from "../ui/card";

export function CommonPhrases() {
  return (
    <div className="space-y-4">
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Common Phrases
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full space-y-2"
        defaultValue={commonPhrasesData[0].category}
      >
        {commonPhrasesData.map((group) => (
          <AccordionItem
            value={group.category}
            key={group.category}
            className="border-none"
          >
            <AccordionTrigger className="rounded-lg bg-card px-6 py-4 text-xl font-semibold hover:no-underline">
              {group.category}
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 gap-4 duration-500 animate-in fade-in-0 slide-in-from-top-4 lg:grid-cols-2">
                {group.translations.map((phrase, index) => (
                  <Card
                    key={index}
                    className="flex flex-col justify-between p-4"
                  >
                    <p className="mb-3 font-sans text-muted-foreground">
                      {phrase.burmese}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-sans font-semibold text-primary">
                        {phrase.chinese}
                      </p>
                      <CopyButton textToCopy={phrase.chinese} />
                    </div>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

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
      <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline">
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
            <AccordionTrigger className="text-xl font-semibold bg-card rounded-lg px-6 py-4 hover:no-underline">
              {group.category}
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-top-4 duration-500">
                {group.translations.map((phrase, index) => (
                  <Card
                    key={index}
                    className="p-4 flex flex-col justify-between"
                  >
                    <p className="text-muted-foreground mb-3 font-sans">
                      {phrase.burmese}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-primary font-semibold font-sans">
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

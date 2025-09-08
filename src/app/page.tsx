import { Translator } from "@/components/app/translator";
import { CommonPhrases } from "@/components/app/common-phrases";
import { Languages } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background text-foreground">
      <header className="container mx-auto w-full max-w-5xl flex justify-between items-center px-4 py-4 md:py-6">
        <div></div>
        <ThemeToggle />
      </header>
      <main className="container mx-auto max-w-5xl px-4 pb-8 md:pb-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-4 mb-4">
            <Languages className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline">
              Myanmar-Chinese Chat Assistant
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            AI-powered translation for customer service chats.
          </p>
        </div>

        <div className="space-y-12">
          <Translator />
          <CommonPhrases />
        </div>
      </main>
    </div>
  );
}

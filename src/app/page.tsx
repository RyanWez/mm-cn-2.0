import { Translator } from "@/components/app/translator";
import { CommonPhrases } from "@/components/app/common-phrases";
import { Languages } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background text-foreground">
      <header className="container mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:py-6">
        <div></div>
        <ThemeToggle />
      </header>
      <main className="container mx-auto max-w-5xl px-4 pb-8 md:pb-12">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-4">
            <Languages className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-4xl font-bold tracking-tight">
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

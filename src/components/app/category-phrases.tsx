"use client";

import { motion } from "framer-motion";
import { commonPhrasesData } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { CopyButton } from "./copy-button";
import { Badge } from "@/components/ui/badge";

interface CategoryPhrasesProps {
  selectedCategory: string | null;
}

export function CategoryPhrases({ selectedCategory }: CategoryPhrasesProps) {
  if (!selectedCategory) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg">Please select a category from the sidebar to view phrases.</p>
      </div>
    );
  }

  const categoryData = commonPhrasesData.find(
    (category) => category.category === selectedCategory
  );

  if (!categoryData) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg">Category not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-6"
    >
      {/* Category Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">
          {categoryData.category}
        </h2>
        <Badge variant="secondary" className="text-xs">
          {categoryData.translations.length} phrases
        </Badge>
      </div>

      {/* Phrases Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {categoryData.translations.map((phrase, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
          >
            <Card className="flex flex-col justify-between p-5 card-hover border-l-4 border-l-primary/20">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                  Myanmar:
                </p>
                <p className="font-sans text-foreground leading-relaxed">
                  {phrase.burmese}
                </p>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Chinese:
                  </p>
                  <p className="font-sans font-semibold text-primary leading-relaxed">
                    {phrase.chinese}
                  </p>
                </div>
                <CopyButton textToCopy={phrase.chinese} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
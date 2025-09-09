"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Copy, Trash2, ChevronDown, ChevronUp, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "../copy-button";
import { getTranslationHistory } from "@/lib/database";

interface TranslationHistoryItem {
  id: string;
  originalText: string;
  translatedText: string;
  createdAt: Date;
}

interface TranslationHistoryProps {
  uid: string | null;
  onSelectTranslation?: (original: string, translated: string) => void;
  refreshTrigger?: number;
}

export function TranslationHistory({ 
  uid, 
  onSelectTranslation,
  refreshTrigger = 0 
}: TranslationHistoryProps) {
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!uid) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const historyData = await getTranslationHistory(uid, 10);
      setHistory(historyData);
    } catch (err) {
      setError("Failed to load translation history");
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchHistory();
  }, [uid, refreshTrigger, fetchHistory]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (!uid) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">
                Translation History
              </CardTitle>
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {history.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading history...
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-8 text-center text-sm text-destructive">
                    {error}
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No translation history yet. Start translating to see your history here!
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {history.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="group rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    Original
                                  </div>
                                  <p className="text-sm leading-relaxed break-words">
                                    {truncateText(item.originalText, 80)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    Translation
                                  </div>
                                  <p className="text-sm leading-relaxed break-words">
                                    {truncateText(item.translatedText, 80)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(item.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <CopyButton textToCopy={item.translatedText} />
                              {onSelectTranslation && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onSelectTranslation(item.originalText, item.translatedText)}
                                  className="h-8 w-8 p-0"
                                  title="Use this translation"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                {history.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Showing recent {history.length} translations
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchHistory}
                        className="text-xs"
                      >
                        Refresh
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
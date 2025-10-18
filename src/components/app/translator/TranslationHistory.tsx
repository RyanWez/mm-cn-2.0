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
import { getTranslationHistory } from "@/lib/storage";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  
  const itemsPerPage = 10;

  const fetchHistory = useCallback(async (page: number = 1) => {
    if (!uid) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // Get all history from localStorage
      const allHistory = getTranslationHistory();
      
      // Add IDs if not present
      const historyWithIds = allHistory.map((item, index) => ({
        ...item,
        id: `history-${index}-${item.createdAt.getTime()}`,
      }));
      
      setTotalCount(historyWithIds.length);
      
      // Paginate
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedHistory = historyWithIds.slice(startIndex, startIndex + itemsPerPage);
      setHistory(paginatedHistory);
    } catch (err) {
      setError("Failed to load translation history");
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [uid, itemsPerPage]);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [uid, refreshTrigger, fetchHistory, currentPage]);

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

  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      
      // Show copied state
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
              {totalCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalCount}
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
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0.0, 0.2, 1],
                opacity: { duration: 0.3 },
                y: { duration: 0.3 }
              }}
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
                  <ScrollArea className="h-[400px] pr-4">
                    <motion.div
                      key={`page-${currentPage}`}
                      className="space-y-4"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                    >
                      {history.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={{
                            hidden: { opacity: 0, y: -15 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          transition={{
                            duration: 0.3,
                            ease: "easeOut",
                          }}
                          layout
                          className="group rounded-lg border bg-card p-4 hover:bg-accent/30 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="space-y-4">
                            {/* Original Text Section */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Original Text
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(item.originalText, `${item.id}-original`)}
                                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Copy original text"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  {copiedStates[`${item.id}-original`] ? "Copied!" : "Copy"}
                                </Button>
                              </div>
                              <div className="bg-muted/50 rounded-md p-3 border-l-2 border-primary/20">
                                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                  {item.originalText}
                                </p>
                              </div>
                            </div>

                            {/* Translation Text Section */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Translation
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(item.translatedText, `${item.id}-translation`)}
                                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Copy translation"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  {copiedStates[`${item.id}-translation`] ? "Copied!" : "Copy"}
                                </Button>
                              </div>
                              <div className="bg-accent/50 rounded-md p-3 border-l-2 border-secondary/40">
                                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                  {item.translatedText}
                                </p>
                              </div>
                            </div>

                            {/* Footer with time and actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(item.createdAt)}
                                </span>
                              </div>
                              
                              {onSelectTranslation && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onSelectTranslation(item.originalText, item.translatedText)}
                                  className="h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Use this translation"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Use
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </ScrollArea>
                )}
                
                {totalCount > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Showing page {currentPage} of {totalPages} ({totalCount} total translations)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchHistory(currentPage)}
                          className="text-xs"
                        >
                          Refresh
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 px-3 text-xs"
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="h-8 w-8 p-0 text-xs"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-8 px-3 text-xs"
                        >
                          Next
                        </Button>
                      </div>
                    )}
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
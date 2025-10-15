/**
 * EvidenceDrawer Component
 * Right-side sheet drawer displaying supporting documents and sentence-level citations
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { InsightItem } from '../../types/insights';
import { FileText, Copy, ExternalLink, User, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  insight: InsightItem | null;
}

export function EvidenceDrawer({ open, onClose, insight }: EvidenceDrawerProps) {
  const [copiedCiteId, setCopiedCiteId] = useState<string | null>(null);

  if (!insight) return null;

  const handleCopyQuote = (quote: string, citeId: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedCiteId(citeId);
    toast.success('Quote copied to clipboard');
    setTimeout(() => setCopiedCiteId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-lg pr-8">
            {insight.canonical_text}
          </SheetTitle>
          <SheetDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={insight.type === 'problem' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {insight.type.toUpperCase()}
              </Badge>
              <span className="text-xs text-gray-500">
                {insight.supporting_docs.length} supporting documents
              </span>
            </div>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Total Citations</div>
                  <div className="font-semibold text-gray-900">
                    {insight.supporting_docs.reduce((acc, doc) => acc + doc.citations.length, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Documents</div>
                  <div className="font-semibold text-gray-900">{insight.supporting_docs.length}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Weighted Score</div>
                  <div className="font-semibold text-[#0077B6]">{insight.weighted_count.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Last Mentioned</div>
                  <div className="font-semibold text-gray-900">{formatDate(insight.last_seen)}</div>
                </div>
              </div>
            </div>

            {/* Aliases */}
            {insight.aliases.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Alternative Phrasings ({insight.aliases_count})
                </h4>
                <div className="space-y-1">
                  {insight.aliases.map((alias, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{alias}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Documents and Citations */}
            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-gray-900 sticky top-0 bg-white py-2">
                Supporting Evidence
              </h4>

              {insight.supporting_docs.map((doc, docIdx) => (
                <div key={docIdx} className="space-y-3">
                  {/* Document Header */}
                  <div className="bg-blue-50 border-l-4 border-[#0077B6] rounded-r-lg p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0077B6] shrink-0" />
                          <h5 className="font-semibold text-sm text-gray-900">{doc.doc_title}</h5>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {doc.uploader}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(doc.date)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-7 px-2 text-xs"
                        onClick={() => toast.info('Open source document (not implemented in mock)')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Citations under this document */}
                  <div className="ml-4 space-y-3">
                    {doc.citations.map((citation, citeIdx) => (
                      <div
                        key={citeIdx}
                        className="border-l-2 border-gray-200 pl-4 py-2 space-y-2 hover:border-[#0077B6] transition-colors"
                      >
                        {/* Quote */}
                        <div className="relative">
                          <MessageSquare className="w-4 h-4 text-gray-400 absolute -left-7 top-1" />
                          <p className="text-sm text-gray-900 italic leading-relaxed">
                            "{citation.quote}"
                          </p>
                        </div>

                        {/* Citation metadata */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {citation.speaker && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {citation.speaker}
                              </div>
                            )}
                            {citation.timestamp && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {citation.timestamp}
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleCopyQuote(citation.quote, citation.cite_id)}
                          >
                            {copiedCiteId === citation.cite_id ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Context */}
                        {citation.context && (
                          <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                            Context: {citation.context}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {docIdx < insight.supporting_docs.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

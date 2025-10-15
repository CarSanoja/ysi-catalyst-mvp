/**
 * InsightWithEvidence Component
 * Shows insight text with supporting quotes in a hover card
 */

import { Quote } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface InsightWithEvidenceProps {
  insight: string | {
    insight_text: string;
    supporting_quotes?: string[];
    context?: string;
  };
  type?: 'problem' | 'proposal';
}

export function InsightWithEvidence({ insight, type = 'problem' }: InsightWithEvidenceProps) {
  // Handle both old format (string) and new format (object)
  const insightText = typeof insight === 'string' ? insight : insight.insight_text;
  const quotes = typeof insight === 'object' ? insight.supporting_quotes || [] : [];
  const context = typeof insight === 'object' ? insight.context : '';

  // If no quotes, just show the text
  if (quotes.length === 0) {
    return <span className="text-gray-700">{insightText}</span>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="text-gray-700 cursor-help hover:text-gray-900 transition-colors flex items-center gap-1.5">
          {insightText}
          <Quote className="w-3 h-3 text-gray-400 shrink-0" />
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-96" side="right" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Supporting Evidence
            </h4>
            <p className="text-sm font-medium text-gray-900 mb-3">
              {insightText}
            </p>
          </div>

          {quotes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">
                Direct Quotes from Document:
              </p>
              {quotes.map((quote, idx) => (
                <blockquote
                  key={idx}
                  className="pl-3 border-l-2 border-blue-400 bg-blue-50/50 py-2 pr-2 rounded-r text-sm italic text-gray-700"
                >
                  "{quote}"
                </blockquote>
              ))}
            </div>
          )}

          {context && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Context:</span> {context}
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

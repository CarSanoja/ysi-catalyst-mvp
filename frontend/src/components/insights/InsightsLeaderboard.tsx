/**
 * InsightsLeaderboard Component
 * Displays a leaderboard of problems or proposals with sorting capability
 */

import React, { useState, useMemo } from 'react';
import { InsightItem, SortOption, InsightType } from '../../types/insights';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { TrendingUp, Hash, Calendar, ChevronDown, FileText, ChevronUp, Copy, CheckCircle2, User, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface InsightsLeaderboardProps {
  title: string;
  insights: InsightItem[];
  type: InsightType;
  initialDisplayCount?: number;
}

export function InsightsLeaderboard({
  title,
  insights,
  type,
  initialDisplayCount = 5,
}: InsightsLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortOption>('weighted_count');
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [copiedCiteId, setCopiedCiteId] = useState<string | null>(null);

  // Sort insights based on selected option
  const sortedInsights = useMemo(() => {
    const sorted = [...insights];

    switch (sortBy) {
      case 'weighted_count':
        return sorted.sort((a, b) => b.weighted_count - a.weighted_count);
      case 'count':
        return sorted.sort((a, b) => b.count - a.count);
      case 'last_seen':
        return sorted.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
      default:
        return sorted;
    }
  }, [insights, sortBy]);

  const visibleInsights = sortedInsights.slice(0, displayCount);
  const hasMore = displayCount < sortedInsights.length;

  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case 'weighted_count':
        return <TrendingUp className="w-4 h-4" />;
      case 'count':
        return <Hash className="w-4 h-4" />;
      case 'last_seen':
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Format date to readable string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Toggle evidence expansion
  const toggleExpanded = (insightId: string) => {
    setExpandedInsightId(expandedInsightId === insightId ? null : insightId);
  };

  // Handle copy quote
  const handleCopyQuote = (quote: string, citeId: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedCiteId(citeId);
    toast.success('Quote copied to clipboard');
    setTimeout(() => setCopiedCiteId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{insights.length} items</p>
        </div>

        {/* Sort Selector */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              {getSortIcon(sortBy)}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weighted_count">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Weighted Score
              </div>
            </SelectItem>
            <SelectItem value="count">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Document Count
              </div>
            </SelectItem>
            <SelectItem value="last_seen">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Most Recent
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard Table */}
      {visibleInsights.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No {type}s found for this pillar</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gray-50">
              <TableRow>
                <TableHead className="w-[60px] text-center">Rank</TableHead>
                <TableHead className="min-w-[300px]">Insight</TableHead>
                <TableHead className="w-[90px] text-center">Aliases</TableHead>
                <TableHead className="w-[80px] text-center">Docs</TableHead>
                <TableHead className="w-[90px] text-center">Score</TableHead>
                <TableHead className="w-[120px]">Last Seen</TableHead>
                <TableHead className="w-[180px]">Top Regions</TableHead>
                <TableHead className="w-[180px]">Top Stakeholders</TableHead>
                <TableHead className="w-[160px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleInsights.map((insight, idx) => {
                const topRegions = insight.breakdowns.by_region.slice(0, 2);
                const topStakeholders = insight.breakdowns.by_stakeholder.slice(0, 2);
                const isExpanded = expandedInsightId === insight.id;

                return (
                  <React.Fragment key={insight.id}>
                    {/* Main Row */}
                    <TableRow className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      {/* Rank */}
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center bg-[#0077B6] text-white rounded-full w-7 h-7 text-sm font-bold">
                          {idx + 1}
                        </div>
                      </TableCell>

                      {/* Insight Text */}
                      <TableCell className="font-medium text-gray-900 whitespace-normal">
                        {insight.canonical_text}
                      </TableCell>

                      {/* Aliases */}
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                          +{insight.aliases_count}
                        </Badge>
                      </TableCell>

                      {/* Docs Count */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Hash className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-semibold text-gray-900 text-sm">{insight.count}</span>
                        </div>
                      </TableCell>

                      {/* Weighted Score */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5 text-[#0077B6]" />
                          <span className="font-semibold text-[#0077B6] text-sm">{insight.weighted_count.toFixed(1)}</span>
                        </div>
                      </TableCell>

                      {/* Last Seen */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs text-gray-700">{formatDate(insight.last_seen)}</span>
                        </div>
                      </TableCell>

                      {/* Top Regions */}
                      <TableCell>
                        {topRegions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {topRegions.map((region, ridx) => (
                              <Badge key={ridx} variant="outline" className="text-xs py-0 h-5">
                                {region.region} ({region.count})
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Top Stakeholders */}
                      <TableCell>
                        {topStakeholders.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {topStakeholders.map((stakeholder, sidx) => (
                              <Badge
                                key={sidx}
                                variant="outline"
                                className="text-xs py-0 h-5 truncate max-w-[85px]"
                                title={stakeholder.name}
                              >
                                {stakeholder.name} ({stakeholder.count})
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#0077B6] border-[#0077B6] hover:bg-[#E8F1F9] text-xs h-7 px-2"
                          onClick={() => toggleExpanded(insight.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3 mr-1" />
                              View ({insight.supporting_docs.length})
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Evidence Row */}
                    {isExpanded && (
                      <TableRow className="bg-blue-50/30">
                        <TableCell colSpan={9} className="p-0">
                          <div className="p-6 space-y-4">
                            {/* Summary Stats */}
                            <div className="bg-white rounded-lg border border-blue-200 p-4">
                              <div className="grid grid-cols-4 gap-4 text-sm">
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
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                  Alternative Phrasings ({insight.aliases_count})
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {insight.aliases.map((alias, aidx) => (
                                    <div key={aidx} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-gray-400 mt-0.5">•</span>
                                      <span>{alias}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Supporting Documents */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900">
                                Supporting Evidence ({insight.supporting_docs.length} documents)
                              </h4>

                              {insight.supporting_docs.map((doc, docIdx) => (
                                <div key={docIdx} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                  {/* Document Header */}
                                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
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
                                        <Badge variant="outline" className="text-xs">
                                          {doc.citations.length} citations
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Citations */}
                                  <div className="space-y-3">
                                    {doc.citations.map((citation, citeIdx) => (
                                      <div
                                        key={citeIdx}
                                        className="pl-4 border-l-2 border-blue-200 py-2 space-y-2 hover:border-[#0077B6] transition-colors"
                                      >
                                        {/* Quote */}
                                        <div className="relative">
                                          <MessageSquare className="w-4 h-4 text-blue-400 absolute -left-7 top-1" />
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
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Show More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setDisplayCount(prev => prev + 5)}
            className="text-[#0077B6] border-[#0077B6] hover:bg-[#E8F1F9]"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            Show {Math.min(5, sortedInsights.length - displayCount)} more
          </Button>
        </div>
      )}
    </div>
  );
}

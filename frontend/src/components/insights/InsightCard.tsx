/**
 * InsightCard Component
 * Individual card displaying a problem or proposal with metrics and breakdowns
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { InsightItem } from '../../types/insights';
import { FileText, Calendar, TrendingUp, Hash, MapPin, Users, Building } from 'lucide-react';

interface InsightCardProps {
  insight: InsightItem;
  onViewEvidence: (insight: InsightItem) => void;
}

export function InsightCard({ insight, onViewEvidence }: InsightCardProps) {
  // Format date to readable string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get top 3 items from breakdowns
  const topRegions = insight.breakdowns.by_region.slice(0, 3);
  const topStakeholders = insight.breakdowns.by_stakeholder.slice(0, 3);

  return (
    <Card className="p-4 bg-white border-2 border-gray-200 hover:border-[#0077B6] transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="flex-1 leading-snug text-gray-900">
            {insight.canonical_text}
          </h4>
          <Badge
            variant="secondary"
            className="shrink-0 bg-gray-100 text-gray-700 text-xs"
          >
            +{insight.aliases_count} aliases
          </Badge>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Hash className="w-3.5 h-3.5 text-gray-500" />
            <div>
              <div className="font-semibold text-gray-900">{insight.count}</div>
              <div className="text-xs text-gray-500">Docs</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="w-3.5 h-3.5 text-[#0077B6]" />
            <div>
              <div className="font-semibold text-[#0077B6]">{insight.weighted_count.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Weighted</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <div>
              <div className="font-semibold text-gray-900 text-xs">{formatDate(insight.last_seen)}</div>
              <div className="text-xs text-gray-500">Last Seen</div>
            </div>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {/* Regions */}
          {topRegions.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Top Regions</div>
                <div className="flex flex-wrap gap-1">
                  {topRegions.map((region, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs py-0 h-5"
                    >
                      {region.region} ({region.count})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stakeholders */}
          {topStakeholders.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Top Stakeholders</div>
                <div className="flex flex-wrap gap-1">
                  {topStakeholders.map((stakeholder, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs py-0 h-5 truncate max-w-[120px]"
                      title={stakeholder.name}
                    >
                      {stakeholder.name} ({stakeholder.count})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 text-[#0077B6] border-[#0077B6] hover:bg-[#E8F1F9]"
          onClick={() => onViewEvidence(insight)}
        >
          <FileText className="w-4 h-4 mr-2" />
          View Evidence ({insight.supporting_docs.length} docs)
        </Button>
      </div>
    </Card>
  );
}

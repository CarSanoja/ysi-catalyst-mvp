import { useState } from 'react';
import { Insight } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Lightbulb, ChevronDown, ChevronUp, ExternalLink, AlertCircle, Target, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const [expandedInsights, setExpandedInsights] = useState<string[]>([]);

  const toggleInsight = (id: string) => {
    if (expandedInsights.includes(id)) {
      setExpandedInsights(expandedInsights.filter(i => i !== id));
    } else {
      setExpandedInsights([...expandedInsights, id]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPillarColor = (pillar: string) => {
    const colors = {
      capital: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      recognition: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      wellbeing: 'bg-green-500/10 text-green-700 border-green-500/20',
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-500/10 text-gray-700';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5" />
        <h3>Synthesized Insights</h3>
        <Badge variant="secondary" className="ml-auto">{insights.length} insights</Badge>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const isExpanded = expandedInsights.includes(insight.id);
          
          return (
            <Collapsible
              key={insight.id}
              open={isExpanded}
              onOpenChange={() => toggleInsight(insight.id)}
            >
              <Card className="border-2">
                <CollapsibleTrigger className="w-full">
                  <div className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary shrink-0" />
                          <h4>{insight.title}</h4>
                        </div>
                        <p className="text-muted-foreground">{insight.summary}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {insight.pillars.map(pillar => (
                        <Badge
                          key={pillar}
                          variant="outline"
                          className={`capitalize ${getPillarColor(pillar)}`}
                        >
                          {pillar}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(insight.date)}
                      </span>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Main Ideas */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm">Main Ideas</h4>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {insight.mainIdeas.map((idea, idx) => (
                          <li key={idx} className="text-sm list-disc text-muted-foreground">
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h4 className="text-sm">Emerging Challenges</h4>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {insight.challenges.map((challenge, idx) => (
                          <li key={idx} className="text-sm list-disc text-muted-foreground">
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <h4 className="text-sm">Collaboration Opportunities</h4>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {insight.opportunities.map((opportunity, idx) => (
                          <li key={idx} className="text-sm list-disc text-muted-foreground">
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm">Recommended Actions</h4>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {insight.recommendations.map((recommendation, idx) => (
                          <li key={idx} className="text-sm list-disc text-muted-foreground">
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sources */}
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Based on {insight.sources.length} source{insight.sources.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Evidence
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No insights generated yet</p>
          <p className="text-sm mt-1">Insights will appear here as content is captured and analyzed</p>
        </div>
      )}
    </Card>
  );
}

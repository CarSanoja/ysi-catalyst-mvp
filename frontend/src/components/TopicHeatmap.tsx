import { TopicActivity } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Flame } from 'lucide-react';

interface TopicHeatmapProps {
  topicActivity: TopicActivity[];
}

export function TopicHeatmap({ topicActivity }: TopicHeatmapProps) {
  const pillars = ['capital', 'recognition', 'wellbeing'] as const;
  
  const getTopicsForPillar = (pillar: typeof pillars[number]) => {
    return topicActivity.filter(t => t.pillar === pillar);
  };

  const getHeatColor = (frequency: number) => {
    if (frequency >= 10) return 'bg-red-500';
    if (frequency >= 7) return 'bg-orange-500';
    if (frequency >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHeatIntensity = (frequency: number) => {
    if (frequency >= 10) return 'opacity-100';
    if (frequency >= 7) return 'opacity-75';
    if (frequency >= 5) return 'opacity-50';
    return 'opacity-30';
  };

  const maxFrequency = Math.max(...topicActivity.map(t => t.frequency));

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-5 h-5" />
        <h3>Topic Heatmap - Discussion Frequency</h3>
      </div>

      <div className="space-y-6">
        {pillars.map(pillar => {
          const topics = getTopicsForPillar(pillar);
          
          return (
            <div key={pillar}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="capitalize">{pillar} Access</h4>
                <Badge variant="outline">{topics.length} topics</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map(topic => (
                  <div
                    key={topic.topic}
                    className="relative overflow-hidden rounded-lg border border-border p-4 group hover:shadow-md transition-shadow"
                  >
                    {/* Heat background */}
                    <div 
                      className={`absolute inset-0 ${getHeatColor(topic.frequency)} ${getHeatIntensity(topic.frequency)}`}
                      style={{ 
                        opacity: (topic.frequency / maxFrequency) * 0.2,
                      }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p>{topic.topic}</p>
                        <Badge 
                          className={`${getHeatColor(topic.frequency)} text-white border-0 shrink-0`}
                        >
                          {topic.frequency}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Last: {new Date(topic.lastDiscussed).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">Frequency Scale</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 opacity-50" />
            <span className="text-sm">Low (1-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500 opacity-50" />
            <span className="text-sm">Medium (5-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500 opacity-75" />
            <span className="text-sm">High (7-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm">Very High (10+)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

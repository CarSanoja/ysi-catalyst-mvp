/**
 * InsightsSidebar Component
 * Left sidebar displaying 3 pillars with problem/proposal counts
 */

import { Pillar, PillarData } from '../../types/insights';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { pillarConfigs } from '../../data/mockInsights';

interface InsightsSidebarProps {
  pillarsData: PillarData[];
  selectedPillar: Pillar;
  onSelectPillar: (pillar: Pillar) => void;
}

export function InsightsSidebar({
  pillarsData,
  selectedPillar,
  onSelectPillar,
}: InsightsSidebarProps) {
  return (
    <div className="space-y-3">
      <div className="px-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Pillars
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Select a pillar to view insights
        </p>
      </div>

      {pillarsData.map((pillarData) => {
        const config = pillarConfigs[pillarData.pillar];
        const isActive = selectedPillar === pillarData.pillar;
        const problemsCount = pillarData.problems.length;
        const proposalsCount = pillarData.proposals.length;

        return (
          <button
            key={pillarData.pillar}
            onClick={() => onSelectPillar(pillarData.pillar)}
            className={cn(
              'w-full text-left transition-all duration-200',
              'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 rounded-lg'
            )}
          >
            <Card
              className={cn(
                'p-4 border-2 transition-all',
                isActive
                  ? `border-[${config.borderColor}] shadow-lg scale-105`
                  : 'border-gray-200 hover:border-gray-300'
              )}
              style={{
                backgroundColor: isActive ? config.bgColor : 'white',
                borderColor: isActive ? config.color : undefined,
              }}
            >
              <div className="space-y-3">
                {/* Icon and Name */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: config.bgColor,
                      color: config.color,
                    }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-semibold text-sm leading-tight"
                      style={{ color: isActive ? config.color : '#1F2937' }}
                    >
                      {config.name}
                    </h4>
                  </div>
                </div>

                {/* Counts */}
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0 h-5"
                      style={{
                        borderColor: config.color,
                        color: config.color,
                      }}
                    >
                      {problemsCount}
                    </Badge>
                    <span className="text-xs text-gray-600">Problems</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0 h-5"
                      style={{
                        borderColor: config.color,
                        color: config.color,
                      }}
                    >
                      {proposalsCount}
                    </Badge>
                    <span className="text-xs text-gray-600">Proposals</span>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: config.color }}>
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="font-medium">Active</span>
                  </div>
                )}
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

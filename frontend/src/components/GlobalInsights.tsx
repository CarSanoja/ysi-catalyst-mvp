/**
 * GlobalInsights Component
 * Main dashboard for Problems and Proposals analysis across pillars
 */

import React, { useState, useMemo } from 'react';
import { Pillar, InsightsData } from '../types/insights';
import { InsightsSidebar } from './insights/InsightsSidebar';
import { InsightsLeaderboard } from './insights/InsightsLeaderboard';
import { Button } from './ui/button';
import { AlertCircle, Loader2, Download } from 'lucide-react';
import { useGlobalInsights } from '../hooks/useApi';
import { exportAllGlobalInsights } from '../utils/globalInsightsExport';

// Map backend pillar names to frontend pillar names
const PILLAR_MAP: Record<string, Pillar> = {
  'access_to_capital': 'capital_access',
  'ecosystem_support': 'ecosystem_support',
  'mental_health': 'wellbeing_recognition',
  'recognition': 'wellbeing_recognition', // Also map recognition to wellbeing
};

export function GlobalInsights() {
  const [selectedPillar, setSelectedPillar] = useState<Pillar>('capital_access');

  // Fetch real data from API
  const { data: apiData, isLoading, isError, error } = useGlobalInsights(15);

  // Transform backend data to frontend format
  const insightsData: InsightsData | null = useMemo(() => {
    if (!apiData || !apiData.pillars) return null;

    return {
      pillars: apiData.pillars.map((pillar: any) => ({
        pillar: PILLAR_MAP[pillar.pillar] || pillar.pillar,
        problems: pillar.problems || [],
        proposals: pillar.proposals || []
      }))
    };
  }, [apiData]);

  // Get current pillar data
  const currentPillarData = insightsData?.pillars.find(
    (p) => p.pillar === selectedPillar
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-muted-foreground">Loading global insights...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Insights</h3>
          <p className="text-muted-foreground mb-4">{error?.message || 'Failed to load global insights'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleExportAll = async () => {
    if (insightsData) {
      await exportAllGlobalInsights(insightsData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <p className="text-muted-foreground">
          Explore problems and proposals identified across all co-creation sessions, organized by pillar
        </p>
        {insightsData && (
          <div className="flex justify-center">
            <Button
              onClick={handleExportAll}
              variant="outline"
              className="gap-2"
              style={{ borderColor: '#0077B6', color: '#0077B6' }}
            >
              <Download className="w-4 h-4" />
              Export Complete Report
            </Button>
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar + Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Pillar Selector */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <InsightsSidebar
              pillarsData={insightsData?.pillars || []}
              selectedPillar={selectedPillar}
              onSelectPillar={setSelectedPillar}
            />
          </div>
        </div>

        {/* Right Content - Dual Leaderboards */}
        <div className="lg:col-span-9">
          {currentPillarData ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Problems Leaderboard */}
              <div>
                <InsightsLeaderboard
                  title="Top Problems"
                  insights={currentPillarData.problems}
                  type="problem"
                />
              </div>

              {/* Proposals Leaderboard */}
              <div>
                <InsightsLeaderboard
                  title="Top Proposals"
                  insights={currentPillarData.proposals}
                  type="proposal"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No data available for this pillar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

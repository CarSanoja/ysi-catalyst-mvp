import { Card } from './ui/card';
import { Users, FileText, Lightbulb, TrendingUp, Activity } from 'lucide-react';
import { Stakeholder, Meeting, Insight } from '../types';

interface DashboardOverviewProps {
  stakeholders: Stakeholder[];
  meetings: Meeting[];
  insights: Insight[];
}

export function DashboardOverview({ stakeholders, meetings, insights }: DashboardOverviewProps) {
  // Calculate metrics
  const totalStakeholders = stakeholders.length;
  const totalMeetings = meetings.length;
  const totalInsights = insights.length;
  
  const stakeholdersByType = stakeholders.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageEngagement = Math.round(
    stakeholders.reduce((sum, s) => sum + s.engagementScore, 0) / stakeholders.length
  );

  const recentActivity = meetings.length > 0
    ? new Date(meetings[meetings.length - 1].date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'No activity';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Stakeholders</p>
              <p className="text-2xl">{totalStakeholders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meetings Captured</p>
              <p className="text-2xl">{totalMeetings}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Insights Generated</p>
              <p className="text-2xl">{totalInsights}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Engagement</p>
              <p className="text-2xl">{averageEngagement}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stakeholder Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4">Stakeholder Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stakeholdersByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(count / totalStakeholders) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg mt-1">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p>Last Meeting</p>
                <p className="text-sm text-muted-foreground">{recentActivity}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg mt-1">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p>Latest Insight</p>
                <p className="text-sm text-muted-foreground">
                  {insights.length > 0 ? insights[insights.length - 1].title : 'None yet'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg mt-1">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p>Active Connections</p>
                <p className="text-sm text-muted-foreground">
                  {stakeholders.reduce((sum, s) => sum + s.relationships.length, 0)} relationships
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

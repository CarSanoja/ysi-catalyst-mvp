import { SentimentData } from '../types';
import { Card } from './ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Smile, Meh, Frown } from 'lucide-react';

interface SentimentTrendsProps {
  sentimentData: SentimentData[];
}

export function SentimentTrends({ sentimentData }: SentimentTrendsProps) {
  const latestData = sentimentData[sentimentData.length - 1];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5" />
        <h3>Sentiment Trends - Ecosystem Alignment</h3>
      </div>

      {/* Current Sentiment Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-5 h-5 text-green-600" />
            <p className="text-sm text-muted-foreground">Positive</p>
          </div>
          <p className="text-2xl">{latestData.positive}%</p>
        </div>
        
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Meh className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-muted-foreground">Neutral</p>
          </div>
          <p className="text-2xl">{latestData.neutral}%</p>
        </div>
        
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Frown className="w-5 h-5 text-red-600" />
            <p className="text-sm text-muted-foreground">Negative</p>
          </div>
          <p className="text-2xl">{latestData.negative}%</p>
        </div>
      </div>

      {/* Sentiment Distribution Over Time */}
      <div className="mb-6">
        <h4 className="mb-3">Sentiment Distribution</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={formatDate}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="positive" 
              stackId="1"
              stroke="#22c55e" 
              fill="#22c55e" 
              fillOpacity={0.6}
              name="Positive"
            />
            <Area 
              type="monotone" 
              dataKey="neutral" 
              stackId="1"
              stroke="#eab308" 
              fill="#eab308" 
              fillOpacity={0.6}
              name="Neutral"
            />
            <Area 
              type="monotone" 
              dataKey="negative" 
              stackId="1"
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.6}
              name="Negative"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Overall Sentiment Trend */}
      <div>
        <h4 className="mb-3">Overall Sentiment Score</h4>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={formatDate}
            />
            <Line 
              type="monotone" 
              dataKey="overall" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              name="Overall Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Lightbulb, Quote, Plus, ExternalLink, Clock, Users, MessageSquare } from "lucide-react";

interface InsightsProps {
  language: 'EN' | 'ES';
}

interface Insight {
  id: string;
  title: string;
  summary: string;
  quotes: Array<{
    text: string;
    speaker: string;
    timestamp: string;
    sessionId: string;
  }>;
  scores: {
    novelty: number;
    impact: number;
    feasibility: number;
    equity: number;
    evidence: number;
  };
  theme: string;
  participants: string[];
  relatedSessions: string[];
}

export function Insights({ language }: InsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const text = {
    EN: {
      insights: 'Session Insights',
      clusteredThemes: 'Auto-Clustered Themes',
      novelty: 'Novelty',
      impact: 'Impact',
      feasibility: 'Feasibility',
      equity: 'Equity',
      evidence: 'Evidence',
      addAsAction: 'Add as Proposed Action',
      viewInSession: 'View in Session',
      keyQuotes: 'Key Quotes',
      participants: 'Participants',
      relatedSessions: 'Related Sessions',
      score: 'Score',
      theme: 'Theme',
      summary: 'Summary',
      provenance: 'Source',
      timestamp: 'Timestamp'
    },
    ES: {
      insights: 'Perspectivas de Sesión',
      clusteredThemes: 'Temas Auto-Agrupados',
      novelty: 'Novedad',
      impact: 'Impacto',
      feasibility: 'Viabilidad',
      equity: 'Equidad',
      evidence: 'Evidencia',
      addAsAction: 'Agregar como Acción Propuesta',
      viewInSession: 'Ver en Sesión',
      keyQuotes: 'Citas Clave',
      participants: 'Participantes',
      relatedSessions: 'Sesiones Relacionadas',
      score: 'Puntuación',
      theme: 'Tema',
      summary: 'Resumen',
      provenance: 'Fuente',
      timestamp: 'Marca de Tiempo'
    }
  };

  const t = text[language];

  // Mock insights data
  const insights: Insight[] = [
    {
      id: '1',
      title: 'Digital Infrastructure as Innovation Foundation',
      summary: 'Multiple participants emphasized that reliable digital infrastructure is the cornerstone for enabling youth-led innovation across regions. This theme emerged strongly with concrete examples from 4 different geographical contexts.',
      quotes: [
        {
          text: "Without reliable internet and digital tools, our youth innovators can't compete on a global scale",
          speaker: 'Sarah Chen',
          timestamp: '14:23:45',
          sessionId: 'session-001'
        },
        {
          text: "We've seen 300% increase in innovation adoption when communities have stable digital infrastructure",
          speaker: 'Dr. James Wright',
          timestamp: '14:25:12',
          sessionId: 'session-001'
        },
        {
          text: "Digital divide is the biggest barrier to equitable innovation opportunities",
          speaker: 'Maria Santos',
          timestamp: '14:27:33',
          sessionId: 'session-001'
        }
      ],
      scores: {
        novelty: 65,
        impact: 89,
        feasibility: 72,
        equity: 94,
        evidence: 88
      },
      theme: 'Infrastructure & Access',
      participants: ['Sarah Chen', 'Dr. James Wright', 'Maria Santos', 'Marcus Johnson'],
      relatedSessions: ['Regional Leadership Forum', 'Innovation Workshop']
    },
    {
      id: '2',
      title: 'Mentorship Matching at Scale',
      summary: 'Strong consensus emerged around the need for systematic mentorship programs that can scale globally while maintaining local relevance. Participants provided specific frameworks and success metrics.',
      quotes: [
        {
          text: "The mentor-mentee matching process needs to go beyond skills to include cultural context and values alignment",
          speaker: 'Elena Rodriguez',
          timestamp: '15:12:22',
          sessionId: 'session-002'
        },
        {
          text: "Our pilot program connected 200 mentors with youth leaders, resulting in 73% project completion rate",
          speaker: 'David Kim',
          timestamp: '15:14:45',
          sessionId: 'session-002'
        }
      ],
      scores: {
        novelty: 45,
        impact: 82,
        feasibility: 91,
        equity: 76,
        evidence: 67
      },
      theme: 'Capacity Building',
      participants: ['Elena Rodriguez', 'David Kim', 'Prof. Amanda Foster'],
      relatedSessions: ['Leadership Circle', 'Community Building Summit']
    },
    {
      id: '3',
      title: 'Climate Solutions Local-Global Paradox',
      summary: 'Tension identified between locally-relevant climate solutions and global scalability. Multiple contradictions flagged around funding priorities and impact measurement approaches.',
      quotes: [
        {
          text: "Local solutions often can't scale globally, but global solutions often fail locally",
          speaker: 'Marcus Johnson',
          timestamp: '16:08:15',
          sessionId: 'session-003'
        },
        {
          text: "We need to rethink how we measure climate impact - local context matters more than we admit",
          speaker: 'Prof. Amanda Foster',
          timestamp: '16:11:30',
          sessionId: 'session-003'
        }
      ],
      scores: {
        novelty: 78,
        impact: 94,
        feasibility: 42,
        equity: 88,
        evidence: 71
      },
      theme: 'Climate Innovation',
      participants: ['Marcus Johnson', 'Prof. Amanda Foster', 'Sarah Chen'],
      relatedSessions: ['Climate Innovation Summit', 'Impact Measurement Workshop']
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-slate-700';
    if (score >= 60) return 'bg-slate-500';
    if (score >= 40) return 'bg-slate-400';
    return 'bg-slate-300';
  };

  const handleAddAsAction = (insight: Insight) => {
    // Mock implementation - would integrate with action tracking system
    console.log('Adding as proposed action:', insight.title);
  };

  const handleViewInSession = (sessionId: string, timestamp: string) => {
    // Mock implementation - would navigate to session view at specific timestamp
    console.log('Viewing session:', sessionId, 'at', timestamp);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t.insights}</h1>
            <p className="text-slate-600 mt-1">{t.clusteredThemes}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Lightbulb className="w-4 h-4" />
            <span>{insights.length} insights generated</span>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="flex-1 p-6">
        <div className="grid gap-6">
          {insights.map((insight) => (
            <Card key={insight.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{insight.title}</CardTitle>
                    <Badge variant="outline" className="mb-3">
                      {insight.theme}
                    </Badge>
                    <p className="text-slate-600">{insight.summary}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddAsAction(insight)}
                    className="ml-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.addAsAction}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Scoring Strip */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">{t.score}</h4>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(insight.scores).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>{t[key as keyof typeof t] || key}</span>
                          <span>{value}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getScoreColor(value)}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Key Quotes */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Quote className="w-4 h-4" />
                    {t.keyQuotes}
                  </h4>
                  <div className="space-y-3">
                    {insight.quotes.map((quote, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-700 italic mb-2">"{quote.text}"</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>— {quote.speaker}</span>
                            <Badge variant="outline" className="text-xs h-5">
                              {quote.timestamp}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInSession(quote.sessionId, quote.timestamp)}
                            className="h-7 px-2"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {t.viewInSession}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Metadata */}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-slate-600 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t.participants}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {insight.participants.map((participant, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-600 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {t.relatedSessions}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {insight.relatedSessions.map((session, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {session}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
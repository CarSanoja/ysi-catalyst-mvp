import { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { 
  FileText, 
  Quote, 
  Plus, 
  Eye, 
  EyeOff, 
  History, 
  Download, 
  Share2,
  Network,
  Edit3,
  Link,
  Clock,
  User,
  Play,
  AlertTriangle,
  CheckCircle2,
  Filter
} from "lucide-react";

interface CharterBuilderProps {
  language: 'EN' | 'ES';
}

interface CharterSection {
  id: string;
  title: string;
  content: string;
  progress: {
    completed: number;
    total: number;
  };
  lastEdit: {
    time: string;
    editor: string;
  };
  citations: Citation[];
}

interface Citation {
  id: string;
  type: 'quote' | 'insight' | 'session';
  content: string;
  speaker?: string;
  timestamp?: string;
  sessionId: string;
  relevanceScore: number;
  consentStatus: 'public' | 'chatham-house' | 'private';
}

interface Evidence {
  paragraphId: string;
  citations: Citation[];
  diversity: {
    regions: number;
    stakeholders: number;
    sessions: number;
  };
}

type ViewMode = 'narrative' | 'evidence-map';

export function CharterBuilder({ language }: CharterBuilderProps) {
  const [selectedSection, setSelectedSection] = useState<string>('principles');
  const [viewMode, setViewMode] = useState<ViewMode>('narrative');
  const [showCitationDrawer, setShowCitationDrawer] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [caretPosition, setCaretPosition] = useState<{ x: number, y: number } | null>(null);
  const [showInlineToolbar, setShowInlineToolbar] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const text = {
    EN: {
      charterBuilder: 'Charter Builder',
      principles: 'Principles',
      priorities: 'Priorities',
      commitments: 'Commitments',
      annexes: 'Annexes',
      narrative: 'Narrative',
      evidenceMap: 'Evidence Map',
      cite: 'Cite',
      insertInsight: 'Insert Insight',
      redact: 'Redact',
      history: 'History',
      export: 'Export',
      share: 'Share',
      lastEdit: 'Last edit',
      insightsSynthesized: 'insights synthesized',
      suggestedSources: 'Suggested Sources',
      relevance: 'Relevance',
      playFrom: 'Play from',
      chathamHouse: 'Chatham House',
      public: 'Public',
      private: 'Private',
      addEvidence: 'Consider adding evidence or reframing as hypothesis',
      diversityNeeded: 'Consider adding perspectives from underrepresented regions',
      draftA: 'Draft A',
      steeringReview: 'Steering Review',
      preSummit: 'Pre-Summit',
      googleDocs: 'Google Docs',
      pdf: 'PDF',
      slides: 'Slides',
      editor: 'Editor',
      reviewer: 'Reviewer',
      viewer: 'Viewer'
    },
    ES: {
      charterBuilder: 'Constructor de Carta',
      principles: 'Principios',
      priorities: 'Prioridades',
      commitments: 'Compromisos',
      annexes: 'Anexos',
      narrative: 'Narrativa',
      evidenceMap: 'Mapa de Evidencia',
      cite: 'Citar',
      insertInsight: 'Insertar Perspectiva',
      redact: 'Redactar',
      history: 'Historial',
      export: 'Exportar',
      share: 'Compartir',
      lastEdit: 'Última edición',
      insightsSynthesized: 'perspectivas sintetizadas',
      suggestedSources: 'Fuentes Sugeridas',
      relevance: 'Relevancia',
      playFrom: 'Reproducir desde',
      chathamHouse: 'Chatham House',
      public: 'Público',
      private: 'Privado',
      addEvidence: 'Considera agregar evidencia o reformular como hipótesis',
      diversityNeeded: 'Considera agregar perspectivas de regiones subrepresentadas',
      draftA: 'Borrador A',
      steeringReview: 'Revisión Directiva',
      preSummit: 'Pre-Cumbre',
      googleDocs: 'Google Docs',
      pdf: 'PDF',
      slides: 'Presentaciones',
      editor: 'Editor',
      reviewer: 'Revisor',
      viewer: 'Espectador'
    }
  };

  const t = text[language];

  // Mock charter sections
  const charterSections: CharterSection[] = [
    {
      id: 'principles',
      title: t.principles,
      content: `The Youth Social Innovation Initiative is founded on the conviction that young people possess unique insights and capabilities essential for addressing global challenges. We recognize that youth-led solutions demonstrate exceptional community adoption rates and sustained impact when provided with appropriate support structures.

Digital infrastructure serves as the foundational enabler for equitable innovation opportunities. Without reliable access to digital tools and connectivity, youth innovators cannot participate meaningfully in the global innovation ecosystem.

Mentorship relationships must transcend traditional skill-based matching to include cultural context and values alignment. Effective mentorship programs scale globally while maintaining local relevance and authenticity.`,
      progress: { completed: 3, total: 5 },
      lastEdit: { time: '2h ago', editor: 'Sarah Chen' },
      citations: []
    },
    {
      id: 'priorities',
      title: t.priorities,
      content: `Our immediate priorities center on bridging the digital divide that constrains youth innovation potential across regions. Infrastructure development must prioritize equity and accessibility while building sustainable local capacity.

Establishing systematic mentorship networks that connect experienced leaders with emerging youth innovators across all three pillars of our framework: Capital, Recognition, and Wellbeing.

Developing frameworks for measuring local impact that can inform global strategy without diminishing the authenticity of community-based solutions.`,
      progress: { completed: 2, total: 4 },
      lastEdit: { time: '4h ago', editor: 'Marcus Johnson' },
      citations: []
    },
    {
      id: 'commitments',
      title: t.commitments,
      content: `We commit to implementing evidence-based approaches that honor both innovation potential and community consent. All initiatives will incorporate transparent feedback mechanisms and respect for local decision-making processes.

Resource allocation will be guided by principles of regional balance and representation, ensuring that no single perspective dominates our collective understanding of youth innovation needs.

We pledge to maintain the highest standards of data protection and participant consent, implementing Chatham House protocols where appropriate to protect contributor confidentiality while preserving institutional learning.`,
      progress: { completed: 4, total: 4 },
      lastEdit: { time: '1d ago', editor: 'Elena Rodriguez' },
      citations: []
    }
  ];

  // Mock citations
  const availableCitations: Citation[] = [
    {
      id: '1',
      type: 'quote',
      content: '"Without reliable internet and digital tools, our youth innovators can\'t compete on a global scale"',
      speaker: 'Sarah Chen',
      timestamp: '14:23:45',
      sessionId: 'session-001',
      relevanceScore: 94,
      consentStatus: 'public'
    },
    {
      id: '2',
      type: 'quote',
      content: '"We\'ve seen 300% increase in innovation adoption when communities have stable digital infrastructure"',
      speaker: 'Dr. James Wright',
      timestamp: '14:25:12',
      sessionId: 'session-001',
      relevanceScore: 89,
      consentStatus: 'public'
    },
    {
      id: '3',
      type: 'insight',
      content: 'Digital Infrastructure as Innovation Foundation: Multiple participants emphasized that reliable digital infrastructure is the cornerstone for enabling youth-led innovation across regions.',
      sessionId: 'session-001',
      relevanceScore: 92,
      consentStatus: 'public'
    },
    {
      id: '4',
      type: 'quote',
      content: '"The mentor-mentee matching process needs to go beyond skills to include cultural context and values alignment"',
      speaker: 'Regional Leader',
      timestamp: '15:12:22',
      sessionId: 'session-002',
      relevanceScore: 87,
      consentStatus: 'chatham-house'
    }
  ];

  const currentSection = charterSections.find(s => s.id === selectedSection);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setCaretPosition({ x: rect.left, y: rect.top - 50 });
      setSelectedText(selection.toString());
      setShowInlineToolbar(true);
    } else {
      setShowInlineToolbar(false);
    }
  };

  const handleCite = () => {
    setShowCitationDrawer(true);
    setShowInlineToolbar(false);
  };

  const handleInsertInsight = () => {
    // Mock implementation - would insert synthesized insight
    console.log('Inserting insight for:', selectedText);
    setShowInlineToolbar(false);
  };

  const handleRedact = () => {
    // Mock implementation - would apply Chatham House anonymization
    console.log('Redacting:', selectedText);
    setShowInlineToolbar(false);
  };

  const renderNarrativeView = () => (
    <div className="max-w-4xl mx-auto">
      {/* Content Editor */}
      <div 
        ref={editorRef}
        className="prose prose-lg max-w-none"
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
      >
        <div className="space-y-6">
          {currentSection?.content.split('\n\n').map((paragraph, index) => (
            <div key={index} className="group relative">
              <p 
                className="leading-relaxed text-slate-700 cursor-text hover:bg-slate-50 p-4 rounded-lg transition-colors"
                contentEditable
                suppressContentEditableWarning
              >
                {paragraph}
                <sup className="text-blue-600 hover:underline cursor-pointer ml-1">
                  [{index + 1}]
                </sup>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Guidance Banners */}
      <div className="mt-8 space-y-3">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">{t.addEvidence}</p>
        </div>
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Filter className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">{t.diversityNeeded}</p>
        </div>
      </div>
    </div>
  );

  const renderEvidenceMapView = () => (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex gap-4">
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Capital
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Recognition
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Wellbeing
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Regions
        </Button>
      </div>
      
      <div className="flex-1 bg-slate-50 rounded-lg p-6">
        <div className="text-center text-slate-500">
          <Network className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p>Evidence Map Visualization</p>
          <p className="text-sm mt-2">Interactive graph showing paragraph-citation relationships</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel - Table of Contents */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="mb-2">{t.charterBuilder}</h1>
          <p className="text-sm text-slate-600">Youth Social Innovation Charter</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {charterSections.map((section) => (
              <Card 
                key={section.id}
                className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                  selectedSection === section.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedSection(section.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">{section.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {section.progress.completed}/{section.progress.total} {t.insightsSynthesized}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={(section.progress.completed / section.progress.total) * 100} 
                    className="h-1.5 mb-3"
                  />
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{t.lastEdit}: {section.lastEdit.time}</span>
                    <span>•</span>
                    <User className="w-3 h-3" />
                    <span>{section.lastEdit.editor}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-slate-600 px-2">Optional</h4>
            <Card className="cursor-pointer hover:bg-slate-50">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm">{t.annexes}</h3>
                <p className="text-xs text-slate-500 mt-1">Supporting documentation</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <History className="w-4 h-4 mr-2" />
              {t.history}
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {t.export}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">{currentSection?.title}</h2>
              <p className="text-sm text-slate-600 mt-1">
                {currentSection?.progress.completed} of {currentSection?.progress.total} insights synthesized
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'narrative' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('narrative')}
                  className="h-8"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t.narrative}
                </Button>
                <Button
                  variant={viewMode === 'evidence-map' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('evidence-map')}
                  className="h-8"
                >
                  <Network className="w-4 h-4 mr-2" />
                  {t.evidenceMap}
                </Button>
              </div>
              
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                {t.share}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {viewMode === 'narrative' ? renderNarrativeView() : renderEvidenceMapView()}
        </div>

        {/* Inline Toolbar */}
        {showInlineToolbar && caretPosition && (
          <div 
            className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2 flex gap-1"
            style={{ 
              left: caretPosition.x, 
              top: caretPosition.y,
              transform: 'translateX(-50%)'
            }}
          >
            <Button variant="ghost" size="sm" onClick={handleCite}>
              <Quote className="w-4 h-4 mr-1" />
              {t.cite}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleInsertInsight}>
              <Plus className="w-4 h-4 mr-1" />
              {t.insertInsight}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedact}>
              <EyeOff className="w-4 h-4 mr-1" />
              {t.redact}
            </Button>
          </div>
        )}
      </div>

      {/* Citation Drawer */}
      {showCitationDrawer && (
        <div className="w-96 border-l border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t.suggestedSources}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCitationDrawer(false)}
              >
                ×
              </Button>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              For: "{selectedText.slice(0, 50)}..."
            </p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {availableCitations
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .map((citation) => (
                <Card key={citation.id} className="cursor-pointer hover:bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {citation.type === 'quote' ? 'Quote' : 'Insight'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{citation.relevanceScore}% {t.relevance}</span>
                        <Badge 
                          variant={citation.consentStatus === 'public' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {t[citation.consentStatus as keyof typeof t]}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-3">
                      {citation.type === 'quote' ? `"${citation.content}"` : citation.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        {citation.speaker && (
                          <>
                            <User className="w-3 h-3" />
                            <span>{citation.speaker}</span>
                          </>
                        )}
                        {citation.timestamp && (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{citation.timestamp}</span>
                          </>
                        )}
                      </div>
                      {citation.timestamp && (
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Play className="w-3 h-3 mr-1" />
                          {t.playFrom} {citation.timestamp}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
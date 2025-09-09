import { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Star, Tag, AlertTriangle, Mic, MicOff, Languages } from "lucide-react";

interface LiveCaptureProps {
  language: 'EN' | 'ES';
  onLanguageToggle: (lang: 'EN' | 'ES') => void;
}

interface CaptureEntry {
  id: string;
  timestamp: string;
  content: string;
  author: string;
  tags: string[];
  highlighted: boolean;
  hasTension: boolean;
}

export function LiveCapture({ language, onLanguageToggle }: LiveCaptureProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [entries, setEntries] = useState<{ [key: string]: CaptureEntry[] }>({
    'shaper-1': [],
    'shaper-2': [],
    'shaper-3': [],
    'shaper-4': [],
    'ai-lane': []
  });
  
  const [currentInput, setCurrentInput] = useState<{ [key: string]: string }>({
    'shaper-1': '',
    'shaper-2': '',
    'shaper-3': '',
    'shaper-4': ''
  });

  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const [liveCaptions, setLiveCaptions] = useState('');

  const text = {
    EN: {
      liveCapture: 'Live Capture',
      shaper: 'Shaper',
      aiLane: 'AI Insights',
      highlight: 'Highlight',
      markTension: 'Mark Tension',
      capital: 'Capital',
      recognition: 'Recognition',
      wellbeing: 'Wellbeing',
      liveCaptions: 'Live Captions',
      typeHere: 'Type your notes here...',
      recording: 'Recording',
      paused: 'Paused',
      toggleRecording: 'Toggle Recording',
      autoHighlight: 'Auto-highlighted key insight',
      contradictionDetected: 'Potential contradiction detected',
      themeEmergence: 'New theme emerging'
    },
    ES: {
      liveCapture: 'Captura en Vivo',
      shaper: 'Shaper',
      aiLane: 'IA Perspectivas',
      highlight: 'Destacar',
      markTension: 'Marcar Tensión',
      capital: 'Capital',
      recognition: 'Reconocimiento',
      wellbeing: 'Bienestar',
      liveCaptions: 'Subtítulos en Vivo',
      typeHere: 'Escribe tus notas aquí...',
      recording: 'Grabando',
      paused: 'Pausado',
      toggleRecording: 'Alternar Grabación',
      autoHighlight: 'Perspectiva clave destacada automáticamente',
      contradictionDetected: 'Posible contradicción detectada',
      themeEmergence: 'Nuevo tema emergente'
    }
  };

  const t = text[language];

  const shapers = [
    { id: 'shaper-1', name: 'Sarah Chen', color: 'bg-blue-50 border-blue-200' },
    { id: 'shaper-2', name: 'Marcus Johnson', color: 'bg-green-50 border-green-200' },
    { id: 'shaper-3', name: 'Elena Rodriguez', color: 'bg-purple-50 border-purple-200' },
    { id: 'shaper-4', name: 'David Kim', color: 'bg-orange-50 border-orange-200' }
  ];

  const pillarTags = [
    { id: 'capital', label: t.capital, color: 'bg-blue-100 text-blue-800' },
    { id: 'recognition', label: t.recognition, color: 'bg-green-100 text-green-800' },
    { id: 'wellbeing', label: t.wellbeing, color: 'bg-purple-100 text-purple-800' }
  ];

  // Mock AI insights
  const aiInsights = [
    {
      id: '1',
      timestamp: '14:23',
      content: t.autoHighlight,
      type: 'highlight',
      insight: '"Youth-led climate solutions show 3x higher community adoption rates"'
    },
    {
      id: '2',
      timestamp: '14:18',
      content: t.contradictionDetected,
      type: 'tension',
      insight: 'Funding priorities: Local impact vs. Global scale'
    },
    {
      id: '3',
      timestamp: '14:15',
      content: t.themeEmergence,
      type: 'theme',
      insight: 'Digital Infrastructure as Foundation for Innovation'
    }
  ];

  const handleAddEntry = (laneId: string) => {
    if (!currentInput[laneId]?.trim()) return;

    const newEntry: CaptureEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      content: currentInput[laneId],
      author: shapers.find(s => s.id === laneId)?.name || '',
      tags: [],
      highlighted: false,
      hasTension: false
    };

    setEntries(prev => ({
      ...prev,
      [laneId]: [...(prev[laneId] || []), newEntry]
    }));

    setCurrentInput(prev => ({
      ...prev,
      [laneId]: ''
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, laneId: string) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddEntry(laneId);
    }
  };

  const toggleHighlight = (laneId: string, entryId: string) => {
    setEntries(prev => ({
      ...prev,
      [laneId]: prev[laneId]?.map(entry => 
        entry.id === entryId 
          ? { ...entry, highlighted: !entry.highlighted }
          : entry
      ) || []
    }));
  };

  const toggleTension = (laneId: string, entryId: string) => {
    setEntries(prev => ({
      ...prev,
      [laneId]: prev[laneId]?.map(entry => 
        entry.id === entryId 
          ? { ...entry, hasTension: !entry.hasTension }
          : entry
      ) || []
    }));
  };

  const addTag = (laneId: string, entryId: string, tagId: string) => {
    setEntries(prev => ({
      ...prev,
      [laneId]: prev[laneId]?.map(entry => 
        entry.id === entryId 
          ? { ...entry, tags: [...entry.tags, tagId] }
          : entry
      ) || []
    }));
  };

  // Mock live captions update
  useEffect(() => {
    if (isRecording) {
      const captions = [
        "So when we think about youth innovation, we're really talking about...",
        "The key challenge is bridging the gap between local communities and...", 
        "I've seen incredible results when we combine digital tools with...",
        "But we also need to consider the equity implications of..."
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        setLiveCaptions(captions[index % captions.length]);
        index++;
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1>{t.liveCapture}</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-sm text-slate-600">
                {isRecording ? t.recording : t.paused}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {t.toggleRecording}
            </Button>
          </div>
        </div>
      </div>

      {/* Capture Canvas */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-5 gap-4 h-full">
          {/* Manual Lanes - 4 Shapers */}
          {shapers.map((shaper) => (
            <Card key={shaper.id} className={`flex flex-col h-full ${shaper.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{shaper.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 p-3">
                {/* Input Area */}
                <Textarea
                  ref={(el) => { textareaRefs.current[shaper.id] = el; }}
                  placeholder={t.typeHere}
                  value={currentInput[shaper.id] || ''}
                  onChange={(e) => setCurrentInput(prev => ({
                    ...prev,
                    [shaper.id]: e.target.value
                  }))}
                  onKeyDown={(e) => handleKeyPress(e, shaper.id)}
                  className="min-h-[100px] resize-none text-sm bg-white/50"
                />

                {/* Quick Actions */}
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 px-2">
                    <Star className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2">
                    <AlertTriangle className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2">
                    <Tag className="w-3 h-3" />
                  </Button>
                </div>

                <Separator />

                {/* Entries */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {entries[shaper.id]?.map((entry) => (
                    <div key={entry.id} className={`p-2 rounded text-xs bg-white/70 ${
                      entry.highlighted ? 'ring-2 ring-yellow-300' : ''
                    } ${entry.hasTension ? 'border-l-2 border-orange-500' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-slate-500">{entry.timestamp}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleHighlight(shaper.id, entry.id)}
                            className={`p-0.5 rounded ${entry.highlighted ? 'text-yellow-600' : 'text-slate-400'}`}
                          >
                            <Star className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => toggleTension(shaper.id, entry.id)}
                            className={`p-0.5 rounded ${entry.hasTension ? 'text-orange-600' : 'text-slate-400'}`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700">{entry.content}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {entry.tags.map((tagId) => {
                            const tag = pillarTags.find(t => t.id === tagId);
                            return tag ? (
                              <Badge key={tagId} className={`text-xs h-4 ${tag.color}`}>
                                {tag.label}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* AI Lane */}
          <Card className="flex flex-col h-full bg-slate-100 border-slate-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white flex items-center justify-center text-xs">
                  AI
                </div>
                {t.aiLane}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3">
              <div className="space-y-3 overflow-y-auto">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className={`p-3 rounded-lg text-xs ${
                    insight.type === 'highlight' ? 'bg-yellow-50 border border-yellow-200' :
                    insight.type === 'tension' ? 'bg-orange-50 border border-orange-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-500">{insight.timestamp}</span>
                      <Badge variant="outline" className="text-xs h-4">
                        {insight.type === 'highlight' ? 'Key Quote' :
                         insight.type === 'tension' ? 'Tension' : 'Theme'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-2">{insight.content}</p>
                    <p className="text-slate-800 font-medium">{insight.insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Bar - Live Captions */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t.liveCaptions}:</span>
              <p className="text-sm text-slate-300">{liveCaptions}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLanguageToggle(language === 'EN' ? 'ES' : 'EN')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Languages className="w-4 h-4 mr-2" />
            {language}
          </Button>
        </div>
      </div>
    </div>
  );
}
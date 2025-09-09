import { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { 
  Upload, 
  FileText, 
  Mic, 
  Headphones, 
  Users, 
  Globe, 
  Heart, 
  DollarSign, 
  Award, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  FileAudio, 
  FileUpload, 
  Pin, 
  Lightbulb, 
  Target, 
  Calendar, 
  User,
  Eye,
  EyeOff,
  Shield,
  Link2,
  Download,
  Share2,
  CheckCircle,
  Edit,
  Trash2,
  ArrowRight,
  Volume2,
  WaveSquare
} from "lucide-react";

interface ManualCaptureProps {
  language: 'EN' | 'ES';
}

interface ProcessedNote {
  id: string;
  originalText: string;
  processedText: string;
  timestamp: string;
  speakers: Speaker[];
  pillars: ('capital' | 'recognition' | 'wellbeing')[];
  terms: NormalizedTerm[];
  quotes: ProcessedQuote[];
  insights: ProcessedInsight[];
  actions: ProcessedAction[];
  consentLevel: 'public' | 'chatham-house' | 'private';
  source: {
    type: 'text' | 'audio';
    filename?: string;
    duration?: string;
  };
  confidence: number;
  lowConfidenceSegments: LowConfidenceSegment[];
}

interface Speaker {
  id: string;
  name: string;
  timestamps: string[];
}

interface NormalizedTerm {
  original: string;
  normalized: string;
  context: string;
}

interface ProcessedQuote {
  id: string;
  text: string;
  speaker: string;
  timestamp: string;
  pillar: 'capital' | 'recognition' | 'wellbeing';
  confidence: number;
  isPinned: boolean;
}

interface ProcessedInsight {
  id: string;
  title: string;
  description: string;
  pillar: 'capital' | 'recognition' | 'wellbeing';
  confidence: number;
}

interface ProcessedAction {
  id: string;
  description: string;
  owner?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

interface LowConfidenceSegment {
  text: string;
  timestamp: string;
  confidence: number;
  needsReview: boolean;
}

export function ManualCapture({ language }: ManualCaptureProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [textInput, setTextInput] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedNotes, setProcessedNotes] = useState<ProcessedNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [consentLevel, setConsentLevel] = useState<'public' | 'chatham-house' | 'private'>('public');
  const [sessionContext, setSessionContext] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const text = {
    EN: {
      manualCapture: 'Manual Capture',
      uploadNotes: 'Upload Notes',
      pasteText: 'Paste Text',
      audioUpload: 'Audio Upload',
      originalNotes: 'Original Notes',
      aiProcessed: 'AI Processed',
      textInput: 'Text Input',
      audioInput: 'Audio Input',
      uploadFiles: 'Upload Files',
      dragDropText: 'Drag and drop text files (DOC, TXT, MD) or click to browse',
      dragDropAudio: 'Drag and drop audio files (MP3, WAV, M4A) or click to browse',
      pasteNotesHere: 'Paste your notes here...',
      sessionContext: 'Session Context',
      sessionContextPlaceholder: 'Enter session name, topic, or meeting context...',
      consentLevel: 'Consent Level',
      public: 'Public',
      chathamHouse: 'Chatham House',
      private: 'Private',
      processNotes: 'Process Notes',
      processing: 'Processing...',
      transcribing: 'Transcribing audio...',
      analyzing: 'Analyzing content...',
      extractingInsights: 'Extracting insights...',
      complete: 'Complete',
      speakers: 'Speakers',
      pillars: 'Pillars',
      capital: 'Capital',
      recognition: 'Recognition',
      wellbeing: 'Wellbeing',
      normalizedTerms: 'Normalized Terms',
      keyQuotes: 'Key Quotes',
      insights: 'Insights',
      actionItems: 'Action Items',
      lowConfidence: 'Low Confidence Segments',
      needsReview: 'Needs Review',
      confidence: 'Confidence',
      pinQuote: 'Pin Quote',
      createInsight: 'Create Insight',
      openAction: 'Open Action',
      assignOwner: 'Assign Owner',
      setDueDate: 'Set Due Date',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      owner: 'Owner',
      dueDate: 'Due Date',
      exportToDrive: 'Export to Drive',
      exportToSheets: 'Export to Sheets',
      addToKnowledge: 'Add to Knowledge Base',
      sendToCharter: 'Send to Charter Builder',
      provenance: 'Provenance',
      filename: 'Filename',
      uploadedAt: 'Uploaded at',
      duration: 'Duration',
      playAudio: 'Play Audio',
      pauseAudio: 'Pause Audio',
      viewTranscript: 'View Transcript',
      editTranscript: 'Edit Transcript',
      approveSegment: 'Approve Segment',
      flagForReview: 'Flag for Review',
      redactSegment: 'Redact Segment',
      timeline: 'Timeline',
      speaker: 'Speaker',
      timestamp: 'Timestamp',
      selectFiles: 'Select Files',
      supportedFormats: 'Supported formats: DOC, TXT, MD, PDF',
      supportedAudioFormats: 'Supported formats: MP3, WAV, M4A, FLAC',
      maxFileSize: 'Max file size: 50MB',
      dropFilesHere: 'Drop files here',
      fileSelected: 'File selected',
      remove: 'Remove',
      noNotesYet: 'No notes processed yet',
      uploadOrPaste: 'Upload files or paste text to get started',
      processingStats: 'Processing Statistics',
      totalNotes: 'Total Notes',
      avgConfidence: 'Avg Confidence',
      flaggedSegments: 'Flagged Segments',
      autoTagged: 'Auto-tagged',
      quickActions: 'Quick Actions',
      bulkExport: 'Bulk Export',
      reviewQueue: 'Review Queue',
      settings: 'Settings'
    },
    ES: {
      manualCapture: 'Captura Manual',
      uploadNotes: 'Subir Notas',
      pasteText: 'Pegar Texto',
      audioUpload: 'Subir Audio',
      originalNotes: 'Notas Originales',
      aiProcessed: 'Procesado por IA',
      textInput: 'Entrada de Texto',
      audioInput: 'Entrada de Audio',
      uploadFiles: 'Subir Archivos',
      dragDropText: 'Arrastra y suelta archivos de texto (DOC, TXT, MD) o haz clic para buscar',
      dragDropAudio: 'Arrastra y suelta archivos de audio (MP3, WAV, M4A) o haz clic para buscar',
      pasteNotesHere: 'Pega tus notas aquí...',
      sessionContext: 'Contexto de Sesión',
      sessionContextPlaceholder: 'Ingresa nombre de sesión, tema o contexto de reunión...',
      consentLevel: 'Nivel de Consentimiento',
      public: 'Público',
      chathamHouse: 'Chatham House',
      private: 'Privado',
      processNotes: 'Procesar Notas',
      processing: 'Procesando...',
      transcribing: 'Transcribiendo audio...',
      analyzing: 'Analizando contenido...',
      extractingInsights: 'Extrayendo perspectivas...',
      complete: 'Completo',
      speakers: 'Oradores',
      pillars: 'Pilares',
      capital: 'Capital',
      recognition: 'Reconocimiento',
      wellbeing: 'Bienestar',
      normalizedTerms: 'Términos Normalizados',
      keyQuotes: 'Citas Clave',
      insights: 'Perspectivas',
      actionItems: 'Elementos de Acción',
      lowConfidence: 'Segmentos de Baja Confianza',
      needsReview: 'Necesita Revisión',
      confidence: 'Confianza',
      pinQuote: 'Anclar Cita',
      createInsight: 'Crear Perspectiva',
      openAction: 'Abrir Acción',
      assignOwner: 'Asignar Responsable',
      setDueDate: 'Establecer Fecha Límite',
      priority: 'Prioridad',
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      owner: 'Responsable',
      dueDate: 'Fecha Límite',
      exportToDrive: 'Exportar a Drive',
      exportToSheets: 'Exportar a Sheets',
      addToKnowledge: 'Agregar a Base de Conocimiento',
      sendToCharter: 'Enviar a Constructor de Carta',
      provenance: 'Procedencia',
      filename: 'Nombre de Archivo',
      uploadedAt: 'Subido en',
      duration: 'Duración',
      playAudio: 'Reproducir Audio',
      pauseAudio: 'Pausar Audio',
      viewTranscript: 'Ver Transcripción',
      editTranscript: 'Editar Transcripción',
      approveSegment: 'Aprobar Segmento',
      flagForReview: 'Marcar para Revisión',
      redactSegment: 'Redactar Segmento',
      timeline: 'Cronología',
      speaker: 'Orador',
      timestamp: 'Marca de Tiempo',
      selectFiles: 'Seleccionar Archivos',
      supportedFormats: 'Formatos soportados: DOC, TXT, MD, PDF',
      supportedAudioFormats: 'Formatos soportados: MP3, WAV, M4A, FLAC',
      maxFileSize: 'Tamaño máximo: 50MB',
      dropFilesHere: 'Suelta archivos aquí',
      fileSelected: 'Archivo seleccionado',
      remove: 'Eliminar',
      noNotesYet: 'Aún no hay notas procesadas',
      uploadOrPaste: 'Sube archivos o pega texto para comenzar',
      processingStats: 'Estadísticas de Procesamiento',
      totalNotes: 'Total de Notas',
      avgConfidence: 'Confianza Promedio',
      flaggedSegments: 'Segmentos Marcados',
      autoTagged: 'Etiquetado Automático',
      quickActions: 'Acciones Rápidas',
      bulkExport: 'Exportación Masiva',
      reviewQueue: 'Cola de Revisión',
      settings: 'Configuración'
    }
  };

  const t = text[language];

  // Mock processed note data
  const mockProcessedNote: ProcessedNote = {
    id: '1',
    originalText: 'Meeting with youth leaders from Latin America to discuss funding opportunities for climate innovation projects. Sarah mentioned the need for $2M in seed funding. The group emphasized local solutions with global impact. Action: Create mentorship platform by Q2.',
    processedText: 'Regional leadership meeting focused on climate innovation funding strategies for Latin American youth initiatives. Discussion centered on $2M seed funding requirements and scalable local solution models.',
    timestamp: new Date().toISOString(),
    speakers: [
      { id: '1', name: 'Sarah Chen', timestamps: ['00:02:15', '00:05:30', '00:12:45'] },
      { id: '2', name: 'Maria Santos', timestamps: ['00:03:20', '00:08:15'] },
      { id: '3', name: 'Carlos Mendez', timestamps: ['00:06:45', '00:11:20'] }
    ],
    pillars: ['capital', 'wellbeing'],
    terms: [
      { original: 'seed funding', normalized: 'Early-stage Capital Investment', context: 'Financial support for initial project development' },
      { original: 'local solutions', normalized: 'Community-based Innovation', context: 'Grassroots approaches with regional focus' }
    ],
    quotes: [
      {
        id: '1',
        text: 'We need to shift from charity mindset to investment mindset when supporting youth innovations.',
        speaker: 'Sarah Chen',
        timestamp: '00:05:30',
        pillar: 'capital',
        confidence: 0.92,
        isPinned: false
      },
      {
        id: '2',
        text: 'Local solutions with global impact - that\'s where youth excel.',
        speaker: 'Maria Santos',
        timestamp: '00:08:15',
        pillar: 'wellbeing',
        confidence: 0.89,
        isPinned: true
      }
    ],
    insights: [
      {
        id: '1',
        title: 'Funding Model Shift',
        description: 'Strong consensus on transitioning from traditional grants to investment-based funding models',
        pillar: 'capital',
        confidence: 0.87
      },
      {
        id: '2',
        title: 'Regional Focus Strategy',
        description: 'Emphasis on developing locally-relevant solutions that can scale globally',
        pillar: 'wellbeing',
        confidence: 0.84
      }
    ],
    actions: [
      {
        id: '1',
        description: 'Create mentorship matching platform for 50+ youth leaders',
        owner: 'Sarah Chen',
        dueDate: '2024-06-30',
        priority: 'high'
      },
      {
        id: '2',
        description: 'Develop funding proposal template for climate innovations',
        priority: 'medium'
      }
    ],
    consentLevel: 'public',
    source: {
      type: 'text',
      filename: 'latin-america-meeting-notes.txt'
    },
    confidence: 0.88,
    lowConfidenceSegments: [
      {
        text: 'The exact amount was... [unclear audio] ...million for the first phase',
        timestamp: '00:07:22',
        confidence: 0.45,
        needsReview: true
      }
    ]
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'text' | 'audio') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        setAudioFile(file);
      }
      // Handle file processing here
    }
  };

  const handleProcessNotes = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessedNotes([mockProcessedNote]);
      setSelectedNote(mockProcessedNote.id);
      setIsProcessing(false);
    }, 3000);
  };

  const selectedNoteData = processedNotes.find(note => note.id === selectedNote);

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'capital': return 'bg-purple-100 text-purple-700';
      case 'recognition': return 'bg-orange-100 text-orange-700';
      case 'wellbeing': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderUploadSection = () => (
    <div className="space-y-6">
      {/* Session Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t.sessionContext}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t.sessionContextPlaceholder}
            value={sessionContext}
            onChange={(e) => setSessionContext(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t.consentLevel}:</label>
              <Select value={consentLevel} onValueChange={(value: any) => setConsentLevel(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t.public}</SelectItem>
                  <SelectItem value="chatham-house">{t.chathamHouse}</SelectItem>
                  <SelectItem value="private">{t.private}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">{t.uploadFiles}</TabsTrigger>
          <TabsTrigger value="paste">{t.pasteText}</TabsTrigger>
          <TabsTrigger value="audio">{t.audioUpload}</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUpload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg mb-2">{t.dragDropText}</p>
                <p className="text-sm text-slate-500 mb-2">{t.supportedFormats}</p>
                <p className="text-xs text-slate-400">{t.maxFileSize}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,.txt,.md,.pdf"
                  onChange={(e) => handleFileUpload(e, 'text')}
                  className="hidden"
                />
                <Button className="mt-4">{t.selectFiles}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <Textarea
                placeholder={t.pasteNotesHere}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-64 text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer"
                onClick={() => audioInputRef.current?.click()}
              >
                <FileAudio className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg mb-2">{t.dragDropAudio}</p>
                <p className="text-sm text-slate-500 mb-2">{t.supportedAudioFormats}</p>
                <p className="text-xs text-slate-400">{t.maxFileSize}</p>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.flac"
                  onChange={(e) => handleFileUpload(e, 'audio')}
                  className="hidden"
                />
                <Button className="mt-4">{t.selectFiles}</Button>
              </div>
              
              {audioFile && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{audioFile.name}</p>
                          <p className="text-sm text-slate-500">
                            {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setAudioFile(null)}
                      >
                        {t.remove}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">{t.processNotes}</h3>
              <p className="text-sm text-slate-600">
                {language === 'EN' 
                  ? 'Transcribe, analyze, and extract insights with YSI taxonomy'
                  : 'Transcribir, analizar y extraer perspectivas con taxonomía YSI'
                }
              </p>
            </div>
            <Button 
              onClick={handleProcessNotes}
              disabled={isProcessing || (!textInput.trim() && !audioFile)}
              className="min-w-32"
            >
              {isProcessing ? t.processing : t.processNotes}
            </Button>
          </div>
          
          {isProcessing && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Progress value={33} className="flex-1" />
                <span className="text-sm text-slate-600">{t.transcribing}</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={66} className="flex-1" />
                <span className="text-sm text-slate-600">{t.analyzing}</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={90} className="flex-1" />
                <span className="text-sm text-slate-600">{t.extractingInsights}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProcessedNotes = () => {
    if (!selectedNoteData) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="mb-2">{t.aiProcessed}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{selectedNoteData.source.filename}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedNoteData.timestamp).toLocaleString()}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getConfidenceColor(selectedNoteData.confidence)}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{Math.round(selectedNoteData.confidence * 100)}% {t.confidence}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedNoteData.pillars.map((pillar) => (
                  <Badge key={pillar} className={getPillarColor(pillar)}>
                    {t[pillar as keyof typeof t]}
                  </Badge>
                ))}
                <Badge variant="outline">
                  {t[selectedNoteData.consentLevel as keyof typeof t]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Original Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t.originalNotes}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <p className="text-sm leading-relaxed">{selectedNoteData.originalText}</p>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI Processed */}
          <Card>
            <CardHeader>
              <CardTitle>{t.aiProcessed}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <p className="text-sm leading-relaxed">{selectedNoteData.processedText}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quotes">{t.keyQuotes}</TabsTrigger>
            <TabsTrigger value="insights">{t.insights}</TabsTrigger>
            <TabsTrigger value="actions">{t.actionItems}</TabsTrigger>
            <TabsTrigger value="speakers">{t.speakers}</TabsTrigger>
            <TabsTrigger value="review">{t.needsReview}</TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            {selectedNoteData.quotes.map((quote) => (
              <Card key={quote.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <blockquote className="text-slate-700 mb-2">"{quote.text}"</blockquote>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>— {quote.speaker}</span>
                        <span>at {quote.timestamp}</span>
                        <Badge className={getPillarColor(quote.pillar)} size="sm">
                          {t[quote.pillar as keyof typeof t]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getConfidenceColor(quote.confidence)}`}>
                        {Math.round(quote.confidence * 100)}%
                      </span>
                      <Button size="sm" variant="outline">
                        <Pin className="w-3 h-3 mr-1" />
                        {t.pinQuote}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {selectedNoteData.insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{insight.title}</h4>
                      <p className="text-sm text-slate-700 mb-3">{insight.description}</p>
                      <Badge className={getPillarColor(insight.pillar)} size="sm">
                        {t[insight.pillar as keyof typeof t]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getConfidenceColor(insight.confidence)}`}>
                        {Math.round(insight.confidence * 100)}%
                      </span>
                      <Button size="sm">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        {t.createInsight}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {selectedNoteData.actions.map((action) => (
              <Card key={action.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 mb-3">{action.description}</p>
                      <div className="flex items-center gap-3">
                        {action.owner && (
                          <Badge variant="outline" size="sm">
                            <User className="w-3 h-3 mr-1" />
                            {action.owner}
                          </Badge>
                        )}
                        {action.dueDate && (
                          <Badge variant="outline" size="sm">
                            <Calendar className="w-3 h-3 mr-1" />
                            {action.dueDate}
                          </Badge>
                        )}
                        <Badge 
                          variant={action.priority === 'high' ? 'destructive' : 'secondary'}
                          size="sm"
                        >
                          {t[action.priority as keyof typeof t]}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm">
                      <Target className="w-3 h-3 mr-1" />
                      {t.openAction}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="speakers" className="space-y-4">
            {selectedNoteData.speakers.map((speaker) => (
              <Card key={speaker.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{speaker.name}</h4>
                    <Badge variant="outline">
                      {speaker.timestamps.length} contributions
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {speaker.timestamps.map((timestamp, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {timestamp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {selectedNoteData.lowConfidenceSegments.map((segment, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 mb-2">"{segment.text}"</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>at {segment.timestamp}</span>
                        <span className={getConfidenceColor(segment.confidence)}>
                          {Math.round(segment.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.approveSegment}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                {t.exportToDrive}
              </Button>
              <Button variant="outline" className="justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                {t.exportToSheets}
              </Button>
              <Button variant="outline" className="justify-start">
                <Lightbulb className="w-4 h-4 mr-2" />
                {t.addToKnowledge}
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                {t.sendToCharter}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full bg-slate-50">
      <div className="flex h-full">
        {/* Left Panel - Upload/Processing */}
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h1 className="mb-2">{t.manualCapture}</h1>
            <p className="text-sm text-slate-600">
              {language === 'EN' 
                ? 'Upload notes and audio for automatic processing and analysis'
                : 'Sube notas y audio para procesamiento y análisis automático'
              }
            </p>
          </div>

          <ScrollArea className="flex-1 p-6">
            {processedNotes.length === 0 ? (
              renderUploadSection()
            ) : (
              <div className="space-y-4">
                {/* Processing Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.processingStats}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500">{t.totalNotes}</div>
                        <div className="font-medium">{processedNotes.length}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">{t.avgConfidence}</div>
                        <div className="font-medium">88%</div>
                      </div>
                      <div>
                        <div className="text-slate-500">{t.flaggedSegments}</div>
                        <div className="font-medium">1</div>
                      </div>
                      <div>
                        <div className="text-slate-500">{t.autoTagged}</div>
                        <div className="font-medium">2 pillars</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes List */}
                <div className="space-y-2">
                  {processedNotes.map((note) => (
                    <Card 
                      key={note.id}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                        selectedNote === note.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedNote(note.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-medium truncate">
                            {note.source.filename}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getConfidenceColor(note.confidence)}`}
                          >
                            {Math.round(note.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                          {note.processedText}
                        </p>
                        <div className="flex gap-1">
                          {note.pillars.map((pillar) => (
                            <Badge key={pillar} className={`${getPillarColor(pillar)} text-xs`}>
                              {t[pillar as keyof typeof t]}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setProcessedNotes([]);
                    setSelectedNote(null);
                    setTextInput('');
                    setAudioFile(null);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {language === 'EN' ? 'Process New Notes' : 'Procesar Nuevas Notas'}
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 overflow-y-auto">
          {processedNotes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <h3 className="mb-2">{t.noNotesYet}</h3>
                <p className="text-slate-600">{t.uploadOrPaste}</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {renderProcessedNotes()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
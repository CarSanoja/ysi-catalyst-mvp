import { useState } from 'react';
import { apiService } from '../services/api';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { 
  Search, 
  Brain, 
  Quote, 
  Play, 
  Plus, 
  FileText, 
  Target, 
  ExternalLink, 
  Clock, 
  User, 
  Globe, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Bookmark, 
  Download,
  Filter
} from "lucide-react";

interface KnowledgeBaseProps {
  language: 'EN' | 'ES';
}

interface QueryResult {
  id: string;
  query: string;
  answer: {
    summary: string;
    confidence: number;
    diversityScore: number;
  };
  pinnedQuotes: Quote[];
  supportingInsights: Insight[];
  contradictions?: Contradiction[];
  redactionStatus: 'none' | 'partial' | 'full';
}

interface Quote {
  id: string;
  text: string;
  speaker: string;
  session: string;
  timestamp: string;
  consentStatus: 'public' | 'chatham-house' | 'private';
  language: 'EN' | 'ES';
}

interface Insight {
  id: string;
  headline: string;
  explanation: string;
  evidenceCount: number;
  theme: string;
  citations: Quote[];
  pillar?: 'capital' | 'recognition' | 'wellbeing';
  region?: string;
}

interface Contradiction {
  id: string;
  summary: string;
  source1: Quote;
  source2: Quote;
}

export function KnowledgeBase({ language }: KnowledgeBaseProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pillarFilter, setPillarFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [stakeholderFilter, setStakeholderFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('search');
  const [savedQueries, setSavedQueries] = useState<string[]>([
    'Youth recognition mechanisms by region',
    'Mental health supports for youth leaders',
    'Inclusive finance models in Latin America'
  ]);

  const text = {
    EN: {
      knowledgeBase: 'Knowledge Base',
      askAI: 'Ask AI',
      searchPlaceholder: 'Ask in plain English: e.g., "What inclusive finance models emerged in Latin America?"',
      search: 'Search',
      pillar: 'Pillar',
      region: 'Region',
      stakeholderType: 'Stakeholder Type',
      all: 'All',
      capital: 'Capital',
      recognition: 'Recognition',
      wellbeing: 'Wellbeing',
      confidence: 'Confidence',
      diversity: 'Diversity',
      summary: 'Summary',
      pinnedQuotes: 'Pinned Quotes',
      supportingInsights: 'Supporting Insights',
      contradictions: 'Contradictions Detected',
      addToCharter: 'Add to Charter',
      proposeAction: 'Propose Action',
      openAt: 'Open at',
      evidenceCount: 'evidence',
      showOnly: 'Show only',
      expand: 'Expand',
      collapse: 'Collapse',
      chathamHouse: 'Chatham House',
      public: 'Public',
      private: 'Private',
      partiallyRedacted: 'Partially redacted due to access permissions',
      savedAnswers: 'Saved Answers',
      saveQuery: 'Save Query',
      exportResults: 'Export Results',
      highConfidence: 'High confidence',
      mediumConfidence: 'Medium confidence',
      lowConfidence: 'Low confidence',
      diverseSources: 'Diverse sources',
      limitedSources: 'Limited sources',
      tensionNote: 'Tension identified between different perspectives',
      googleDocs: 'Google Docs',
      slides: 'Slides',
      principles: 'Principles',
      priorities: 'Priorities',
      commitments: 'Commitments',
      includeFootnotes: 'Include as footnotes',
      includeAppendix: 'Include in appendix'
    },
    ES: {
      knowledgeBase: 'Base de Conocimiento',
      askAI: 'Preguntar IA',
      searchPlaceholder: 'Pregunta en español: ej. "¿Qué modelos de finanzas inclusivas surgieron en América Latina?"',
      search: 'Buscar',
      pillar: 'Pilar',
      region: 'Región',
      stakeholderType: 'Tipo de Participante',
      all: 'Todos',
      capital: 'Capital',
      recognition: 'Reconocimiento',
      wellbeing: 'Bienestar',
      confidence: 'Confianza',
      diversity: 'Diversidad',
      summary: 'Resumen',
      pinnedQuotes: 'Citas Destacadas',
      supportingInsights: 'Perspectivas de Apoyo',
      contradictions: 'Contradicciones Detectadas',
      addToCharter: 'Agregar a Carta',
      proposeAction: 'Proponer Acción',
      openAt: 'Abrir en',
      evidenceCount: 'evidencia',
      showOnly: 'Mostrar solo',
      expand: 'Expandir',
      collapse: 'Contraer',
      chathamHouse: 'Chatham House',
      public: 'Público',
      private: 'Privado',
      partiallyRedacted: 'Parcialmente redactado por permisos de acceso',
      savedAnswers: 'Respuestas Guardadas',
      saveQuery: 'Guardar Consulta',
      exportResults: 'Exportar Resultados',
      highConfidence: 'Alta confianza',
      mediumConfidence: 'Confianza media',
      lowConfidence: 'Baja confianza',
      diverseSources: 'Fuentes diversas',
      limitedSources: 'Fuentes limitadas',
      tensionNote: 'Tensión identificada entre diferentes perspectivas',
      googleDocs: 'Google Docs',
      slides: 'Presentaciones',
      principles: 'Principios',
      priorities: 'Prioridades',
      commitments: 'Compromisos',
      includeFootnotes: 'Incluir como notas al pie',
      includeAppendix: 'Incluir en apéndice'
    }
  };

  const t = text[language];

  // Real API search function
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      // Determine search mode based on filters
      let searchMode: 'hybrid' | 'vector' | 'text' | 'semantic' = 'hybrid';
      if (query.toLowerCase().includes('similar') || query.toLowerCase().includes('parecido')) {
        searchMode = 'vector';
      } else if (query.toLowerCase().includes('meaning') || query.toLowerCase().includes('significa')) {
        searchMode = 'semantic';
      }

      // Call real API
      const response = await apiService.queryKnowledge({
        query,
        search_mode: searchMode,
        limit: 10,
        context: {
          pillar: pillarFilter !== 'all' ? pillarFilter : undefined,
          region: regionFilter !== 'all' ? regionFilter : undefined,
          stakeholder_type: stakeholderFilter !== 'all' ? stakeholderFilter : undefined
        }
      });

      // Convert backend response to frontend format
      const convertedResult = apiService.convertToFrontendFormat(response);
      setResults(convertedResult);
      
    } catch (error) {
      console.error('Search failed:', error);
      
      // Fallback to a simple error result
      setResults({
        id: 'error',
        query,
        answer: {
          summary: 'Sorry, we encountered an issue while searching the knowledge base. Please try again or check if the backend service is running.',
          confidence: 0,
          diversityScore: 0
        },
        pinnedQuotes: [],
        supportingInsights: [],
        contradictions: [],
        redactionStatus: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return t.highConfidence;
    if (confidence >= 60) return t.mediumConfidence;
    return t.lowConfidence;
  };

  const getDiversityLabel = (diversity: number) => {
    return diversity >= 70 ? t.diverseSources : t.limitedSources;
  };

  const handleAddToCharter = () => {
    // Mock implementation - would open dialog to select charter section
    console.log('Adding to charter:', results?.answer.summary);
  };

  const handleProposeAction = () => {
    // Mock implementation - would create tracked action
    console.log('Proposing action for:', results?.query);
  };

  const handleSaveQuery = () => {
    if (query && !savedQueries.includes(query)) {
      setSavedQueries(prev => [...prev, query]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h1>{t.knowledgeBase}</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">{t.askAI}</TabsTrigger>
            <TabsTrigger value="saved">{t.savedAnswers}</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 mt-4">
            {/* Search Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder={t.searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-12 h-12 text-base"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={!query.trim() || loading}
                  className="absolute right-1 top-1 h-10"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Select value={pillarFilter} onValueChange={setPillarFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all} {t.pillar}</SelectItem>
                    <SelectItem value="capital">{t.capital}</SelectItem>
                    <SelectItem value="recognition">{t.recognition}</SelectItem>
                    <SelectItem value="wellbeing">{t.wellbeing}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all} {t.region}</SelectItem>
                    <SelectItem value="latin-america">Latin America</SelectItem>
                    <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={stakeholderFilter} onValueChange={setStakeholderFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all} {t.stakeholderType}</SelectItem>
                    <SelectItem value="youth-leaders">Youth Leaders</SelectItem>
                    <SelectItem value="mentors">Mentors</SelectItem>
                    <SelectItem value="policy-makers">Policy Makers</SelectItem>
                    <SelectItem value="researchers">Researchers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <div className="space-y-2">
              {savedQueries.map((savedQuery, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => {
                    setQuery(savedQuery);
                    setActiveTab('search');
                  }}
                >
                  <Bookmark className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{savedQuery}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-3" />
              <p className="text-slate-600">Analyzing knowledge base...</p>
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="max-w-4xl space-y-6">
            {/* Answer Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{t.summary}</CardTitle>
                    <div className="flex items-center gap-4 mb-3">
                      <Badge className={`${getConfidenceColor(results.answer.confidence)} border-0`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {getConfidenceLabel(results.answer.confidence)} ({results.answer.confidence}%)
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        {getDiversityLabel(results.answer.diversityScore)}
                      </Badge>
                      {results.redactionStatus === 'partial' && (
                        <Badge variant="outline" className="text-xs text-amber-600">
                          <Shield className="w-3 h-3 mr-1" />
                          {t.partiallyRedacted}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveQuery}>
                      <Bookmark className="w-4 h-4 mr-2" />
                      {t.saveQuery}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleAddToCharter}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t.addToCharter}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleProposeAction}>
                      <Target className="w-4 h-4 mr-2" />
                      {t.proposeAction}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{results.answer.summary}</p>
              </CardContent>
            </Card>

            {/* Pinned Quotes */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Quote className="w-5 h-5" />
                  {t.pinnedQuotes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.pinnedQuotes.map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-4 bg-slate-50">
                      <p className="text-slate-700 italic mb-3">"{quote.text}"</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{quote.speaker}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{quote.session}</span>
                          </div>
                          <Badge 
                            variant={quote.consentStatus === 'public' ? 'secondary' : 'outline'}
                            className="text-xs h-5"
                          >
                            {t[quote.consentStatus as keyof typeof t]}
                          </Badge>
                          <Badge variant="outline" className="text-xs h-5">
                            {quote.language}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7">
                          <Play className="w-3 h-3 mr-1" />
                          {t.openAt} {quote.timestamp}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Supporting Insights */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t.supportingInsights}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.supportingInsights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{insight.headline}</h4>
                          <p className="text-sm text-slate-600 mb-2">{insight.explanation}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.evidenceCount} {t.evidenceCount}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {insight.theme}
                            </Badge>
                            {insight.pillar && (
                              <Badge variant="outline" className="text-xs">
                                {t[insight.pillar as keyof typeof t]}
                              </Badge>
                            )}
                            {insight.region && (
                              <Badge variant="outline" className="text-xs">
                                {insight.region}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t.expand}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contradictions */}
            {results.contradictions && results.contradictions.length > 0 && (
              <Card className="shadow-sm border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="w-5 h-5" />
                    {t.contradictions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.contradictions.map((contradiction) => (
                    <div key={contradiction.id} className="space-y-4">
                      <p className="text-sm text-orange-800 bg-orange-50 p-3 rounded-lg">
                        {t.tensionNote}: {contradiction.summary}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-3 bg-slate-50">
                          <p className="text-sm italic mb-2">"{contradiction.source1.text}"</p>
                          <div className="text-xs text-slate-600">
                            — {contradiction.source1.speaker}, {contradiction.source1.session}
                          </div>
                        </div>
                        <div className="border rounded-lg p-3 bg-slate-50">
                          <p className="text-sm italic mb-2">"{contradiction.source2.text}"</p>
                          <div className="text-xs text-slate-600">
                            — {contradiction.source2.speaker}, {contradiction.source2.session}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Export Options */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.exportResults}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t.googleDocs}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t.slides}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
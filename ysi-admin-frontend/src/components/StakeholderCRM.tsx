import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { 
  Search, 
  Users, 
  Plus, 
  Filter, 
  Calendar, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Star, 
  ArrowRight, 
  Clock, 
  Target, 
  FileText, 
  Shield, 
  Eye, 
  EyeOff, 
  Download, 
  Link2, 
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Activity,
  User,
  Globe,
  Heart,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle2,
  Edit2
} from "lucide-react";

interface StakeholderCRMProps {
  language: 'EN' | 'ES';
}

interface Stakeholder {
  id: string;
  name: string;
  type: 'individual' | 'organization';
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  location: string;
  avatar?: string;
  tags: string[];
  pillars: ('capital' | 'recognition' | 'wellbeing')[];
  pipeline: 'prospect' | 'engaged' | 'committed';
  engagementScore: number;
  consentStatus: 'public' | 'chatham-house' | 'private';
  lastInteraction: string;
  interactions: Interaction[];
  nextSteps: NextStep[];
  notes: string;
  createdAt: string;
  owner: string;
}

interface Interaction {
  id: string;
  type: 'meeting' | 'email' | 'session' | 'call' | 'document';
  title: string;
  date: string;
  summary: string;
  evidenceLinks?: string[];
  participants?: string[];
  consentLevel: 'public' | 'chatham-house' | 'private';
}

interface NextStep {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export function StakeholderCRM({ language }: StakeholderCRMProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);
  const [filterPillar, setFilterPillar] = useState('all');
  const [filterPipeline, setFilterPipeline] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const text = {
    EN: {
      stakeholderCRM: 'Stakeholder CRM',
      searchPlaceholder: 'Search stakeholders, organizations, or tags...',
      addStakeholder: 'Add Stakeholder',
      individual: 'Individual',
      organization: 'Organization',
      prospect: 'Prospect',
      engaged: 'Engaged',
      committed: 'Committed',
      capital: 'Capital',
      recognition: 'Recognition',
      wellbeing: 'Wellbeing',
      all: 'All',
      type: 'Type',
      pillar: 'Pillar',
      pipeline: 'Pipeline',
      engagementScore: 'Engagement Score',
      lastInteraction: 'Last Interaction',
      interactions: 'Interactions',
      nextSteps: 'Next Steps',
      addNextStep: 'Add Next Step',
      dueDate: 'Due Date',
      owner: 'Owner',
      priority: 'Priority',
      status: 'Status',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      notes: 'Notes',
      consentStatus: 'Consent Status',
      public: 'Public',
      chathamHouse: 'Chatham House',
      private: 'Private',
      export: 'Export',
      gmail: 'Gmail',
      drive: 'Drive',
      audit: 'Audit Trail',
      coverage: 'Coverage Report',
      gaps: 'Gaps Analysis',
      momentum: 'Momentum Dashboard',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      position: 'Position',
      location: 'Location',
      tags: 'Tags',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      meeting: 'Meeting',
      session: 'Session',
      call: 'Call',
      document: 'Document',
      timeline: 'Timeline',
      summary: 'Summary',
      evidence: 'Evidence',
      participants: 'Participants',
      aiSummary: 'AI Summary',
      openEvidence: 'Open Evidence',
      scheduleFollowUp: 'Schedule Follow-up',
      viewProfile: 'View Profile',
      diversity: 'Diversity',
      recency: 'Recency',
      frequency: 'Frequency',
      influence: 'Cross-Session Influence',
      alignment: 'Mission Alignment',
      diversityUplift: 'Diversity Uplift',
      totalStakeholders: 'Total Stakeholders',
      activeEngagements: 'Active Engagements',
      pendingActions: 'Pending Actions',
      thisWeek: 'This Week',
      thisMonth: 'This Month'
    },
    ES: {
      stakeholderCRM: 'CRM de Interesados',
      searchPlaceholder: 'Buscar interesados, organizaciones o etiquetas...',
      addStakeholder: 'Agregar Interesado',
      individual: 'Individual',
      organization: 'Organización',
      prospect: 'Prospecto',
      engaged: 'Comprometido',
      committed: 'Confirmado',
      capital: 'Capital',
      recognition: 'Reconocimiento',
      wellbeing: 'Bienestar',
      all: 'Todos',
      type: 'Tipo',
      pillar: 'Pilar',
      pipeline: 'Flujo',
      engagementScore: 'Puntuación de Compromiso',
      lastInteraction: 'Última Interacción',
      interactions: 'Interacciones',
      nextSteps: 'Próximos Pasos',
      addNextStep: 'Agregar Próximo Paso',
      dueDate: 'Fecha Límite',
      owner: 'Responsable',
      priority: 'Prioridad',
      status: 'Estado',
      pending: 'Pendiente',
      inProgress: 'En Progreso',
      completed: 'Completado',
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      notes: 'Notas',
      consentStatus: 'Estado de Consentimiento',
      public: 'Público',
      chathamHouse: 'Chatham House',
      private: 'Privado',
      export: 'Exportar',
      gmail: 'Gmail',
      drive: 'Drive',
      audit: 'Registro de Auditoría',
      coverage: 'Reporte de Cobertura',
      gaps: 'Análisis de Brechas',
      momentum: 'Panel de Momentum',
      name: 'Nombre',
      email: 'Correo',
      phone: 'Teléfono',
      position: 'Posición',
      location: 'Ubicación',
      tags: 'Etiquetas',
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      meeting: 'Reunión',
      session: 'Sesión',
      call: 'Llamada',
      document: 'Documento',
      timeline: 'Cronología',
      summary: 'Resumen',
      evidence: 'Evidencia',
      participants: 'Participantes',
      aiSummary: 'Resumen IA',
      openEvidence: 'Abrir Evidencia',
      scheduleFollowUp: 'Programar Seguimiento',
      viewProfile: 'Ver Perfil',
      diversity: 'Diversidad',
      recency: 'Recencia',
      frequency: 'Frecuencia',
      influence: 'Influencia Entre Sesiones',
      alignment: 'Alineación con Misión',
      diversityUplift: 'Mejora de Diversidad',
      totalStakeholders: 'Total de Interesados',
      activeEngagements: 'Compromisos Activos',
      pendingActions: 'Acciones Pendientes',
      thisWeek: 'Esta Semana',
      thisMonth: 'Este Mes'
    }
  };

  const t = text[language];

  // Mock stakeholder data
  const stakeholders: Stakeholder[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      type: 'individual',
      email: 'sarah.chen@example.org',
      phone: '+1-555-0123',
      organization: 'Global Innovation Hub',
      position: 'Director of Youth Programs',
      location: 'Singapore',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b36f4e6e?w=100&h=100&fit=crop&crop=face',
      tags: ['Digital Infrastructure', 'APAC', 'Youth Leadership'],
      pillars: ['capital', 'recognition'],
      pipeline: 'committed',
      engagementScore: 92,
      consentStatus: 'public',
      lastInteraction: '2 days ago',
      interactions: [
        {
          id: '1',
          type: 'session',
          title: 'Digital Infrastructure Summit',
          date: '2024-03-15',
          summary: 'Discussed scaling digital access across APAC youth programs. Emphasized need for infrastructure-first approach.',
          evidenceLinks: ['session-001-14:23:45'],
          participants: ['Marcus Johnson', 'Elena Rodriguez'],
          consentLevel: 'public'
        },
        {
          id: '2',
          type: 'email',
          title: 'Follow-up on Partnership Framework',
          date: '2024-03-10',
          summary: 'Confirmed interest in co-developing mentorship platform. Shared technical requirements.',
          consentLevel: 'public'
        }
      ],
      nextSteps: [
        {
          id: '1',
          title: 'Finalize Partnership Agreement',
          description: 'Review and sign formal partnership terms for digital platform collaboration',
          dueDate: '2024-03-25',
          owner: 'Marcus Johnson',
          status: 'in-progress',
          priority: 'high'
        }
      ],
      notes: 'Strong advocate for infrastructure-first approach. Excellent connections across APAC region.',
      createdAt: '2024-01-15',
      owner: 'Marcus Johnson'
    },
    {
      id: '2',
      name: 'Youth Innovation Foundation',
      type: 'organization',
      email: 'contact@yif.org',
      location: 'São Paulo, Brazil',
      tags: ['Funding', 'Latin America', 'Climate Innovation'],
      pillars: ['capital', 'wellbeing'],
      pipeline: 'engaged',
      engagementScore: 78,
      consentStatus: 'chatham-house',
      lastInteraction: '1 week ago',
      interactions: [
        {
          id: '3',
          type: 'meeting',
          title: 'Funding Strategy Discussion',
          date: '2024-03-08',
          summary: 'Explored co-funding opportunities for Latin American climate initiatives. Positive reception.',
          consentLevel: 'chatham-house'
        }
      ],
      nextSteps: [
        {
          id: '2',
          title: 'Prepare Funding Proposal',
          description: 'Draft comprehensive proposal for climate innovation fund',
          dueDate: '2024-03-30',
          owner: 'Elena Rodriguez',
          status: 'pending',
          priority: 'medium'
        }
      ],
      notes: 'Significant funding capacity. Strong focus on climate solutions in Latin America.',
      createdAt: '2024-02-01',
      owner: 'Elena Rodriguez'
    },
    {
      id: '3',
      name: 'Dr. James Wright',
      type: 'individual',
      email: 'j.wright@research.edu',
      organization: 'Cambridge Innovation Lab',
      position: 'Research Director',
      location: 'Cambridge, UK',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      tags: ['Research', 'Policy', 'European Networks'],
      pillars: ['recognition', 'wellbeing'],
      pipeline: 'prospect',
      engagementScore: 45,
      consentStatus: 'public',
      lastInteraction: '3 weeks ago',
      interactions: [
        {
          id: '4',
          type: 'session',
          title: 'Research Collaboration Workshop',
          date: '2024-02-20',
          summary: 'Presented research on youth innovation metrics. Expressed interest in collaboration.',
          evidenceLinks: ['session-003-16:45:22'],
          consentLevel: 'public'
        }
      ],
      nextSteps: [
        {
          id: '3',
          title: 'Schedule Research Alignment Call',
          description: 'Arrange follow-up discussion on potential research collaboration',
          dueDate: '2024-03-20',
          owner: 'Sarah Chen',
          status: 'pending',
          priority: 'low'
        }
      ],
      notes: 'Academic perspective valuable for framework development. Potential research partnership.',
      createdAt: '2024-02-20',
      owner: 'Sarah Chen'
    }
  ];

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = searchQuery === '' || 
      stakeholder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stakeholder.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stakeholder.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPillar = filterPillar === 'all' || stakeholder.pillars.includes(filterPillar as any);
    const matchesPipeline = filterPipeline === 'all' || stakeholder.pipeline === filterPipeline;
    const matchesType = filterType === 'all' || stakeholder.type === filterType;
    
    return matchesSearch && matchesPillar && matchesPipeline && matchesType;
  });

  const selectedStakeholderData = stakeholders.find(s => s.id === selectedStakeholder);

  const getPipelineColor = (pipeline: string) => {
    switch (pipeline) {
      case 'prospect': return 'bg-slate-100 text-slate-700';
      case 'engaged': return 'bg-blue-100 text-blue-700';
      case 'committed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'capital': return 'bg-purple-100 text-purple-700';
      case 'recognition': return 'bg-orange-100 text-orange-700';
      case 'wellbeing': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEngagementScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStakeholderList = () => (
    <div className="space-y-2">
      {filteredStakeholders.map((stakeholder) => (
        <Card 
          key={stakeholder.id} 
          className={`cursor-pointer transition-colors hover:bg-slate-50 ${
            selectedStakeholder === stakeholder.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedStakeholder(stakeholder.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
                <AvatarFallback>
                  {stakeholder.type === 'organization' ? (
                    <Building className="h-6 w-6" />
                  ) : (
                    stakeholder.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium truncate">{stakeholder.name}</h3>
                    {stakeholder.organization && stakeholder.type === 'individual' && (
                      <p className="text-sm text-slate-600">{stakeholder.position} at {stakeholder.organization}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>{stakeholder.location}</span>
                      <span>•</span>
                      <span>{stakeholder.lastInteraction}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getEngagementScoreColor(stakeholder.engagementScore)}`}>
                      {stakeholder.engagementScore}% engagement
                    </div>
                    <Badge className={`${getPipelineColor(stakeholder.pipeline)} mt-1`}>
                      {t[stakeholder.pipeline as keyof typeof t]}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {stakeholder.pillars.map((pillar) => (
                      <Badge key={pillar} className={`${getPillarColor(pillar)} text-xs`}>
                        {t[pillar as keyof typeof t]}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {stakeholder.consentStatus === 'chatham-house' ? 'CH' : stakeholder.consentStatus}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStakeholderDetail = () => {
    if (!selectedStakeholderData) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={selectedStakeholderData.avatar} alt={selectedStakeholderData.name} />
            <AvatarFallback>
              {selectedStakeholderData.type === 'organization' ? (
                <Building className="h-8 w-8" />
              ) : (
                selectedStakeholderData.name.split(' ').map(n => n[0]).join('').toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-1">{selectedStakeholderData.name}</h2>
                {selectedStakeholderData.organization && selectedStakeholderData.type === 'individual' && (
                  <p className="text-slate-600 mb-2">{selectedStakeholderData.position} at {selectedStakeholderData.organization}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{selectedStakeholderData.email}</span>
                  </div>
                  {selectedStakeholderData.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{selectedStakeholderData.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedStakeholderData.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t.edit}
                </Button>
                <Button size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  {t.addNextStep}
                </Button>
              </div>
            </div>

            {/* Engagement Score Breakdown */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{t.engagementScore}</h4>
                  <span className={`text-2xl font-medium ${getEngagementScoreColor(selectedStakeholderData.engagementScore)}`}>
                    {selectedStakeholderData.engagementScore}%
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">{t.recency}</div>
                    <Progress value={85} className="h-1.5 mt-1" />
                  </div>
                  <div>
                    <div className="text-slate-500">{t.frequency}</div>
                    <Progress value={90} className="h-1.5 mt-1" />
                  </div>
                  <div>
                    <div className="text-slate-500">{t.influence}</div>
                    <Progress value={95} className="h-1.5 mt-1" />
                  </div>
                  <div>
                    <div className="text-slate-500">{t.alignment}</div>
                    <Progress value={92} className="h-1.5 mt-1" />
                  </div>
                  <div>
                    <div className="text-slate-500">{t.diversityUplift}</div>
                    <Progress value={88} className="h-1.5 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags and Pipeline */}
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-1">
                {selectedStakeholderData.pillars.map((pillar) => (
                  <Badge key={pillar} className={getPillarColor(pillar)}>
                    {t[pillar as keyof typeof t]}
                  </Badge>
                ))}
              </div>
              <Badge className={getPipelineColor(selectedStakeholderData.pipeline)}>
                {t[selectedStakeholderData.pipeline as keyof typeof t]}
              </Badge>
              <Badge variant="outline">
                {t[selectedStakeholderData.consentStatus as keyof typeof t]}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="interactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interactions">{t.interactions}</TabsTrigger>
            <TabsTrigger value="next-steps">{t.nextSteps}</TabsTrigger>
            <TabsTrigger value="notes">{t.notes}</TabsTrigger>
          </TabsList>

          <TabsContent value="interactions" className="space-y-4">
            {selectedStakeholderData.interactions.map((interaction) => (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {interaction.type === 'meeting' && <Calendar className="w-4 h-4 text-blue-600" />}
                        {interaction.type === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                        {interaction.type === 'session' && <Users className="w-4 h-4 text-blue-600" />}
                        {interaction.type === 'call' && <Phone className="w-4 h-4 text-blue-600" />}
                        {interaction.type === 'document' && <FileText className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{interaction.title}</h4>
                        <p className="text-sm text-slate-500">{interaction.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {t[interaction.consentLevel as keyof typeof t]}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-700 mb-3">{interaction.summary}</p>
                  
                  {interaction.evidenceLinks && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Link2 className="w-3 h-3 mr-1" />
                        {t.openEvidence}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {t.scheduleFollowUp}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="next-steps" className="space-y-4">
            {selectedStakeholderData.nextSteps.map((step) => (
              <Card key={step.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                    </div>
                    <Badge 
                      variant={step.priority === 'high' ? 'destructive' : step.priority === 'medium' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {t[step.priority as keyof typeof t]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{step.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{step.owner}</span>
                      </div>
                    </div>
                    <Badge variant={step.status === 'completed' ? 'secondary' : 'outline'}>
                      {t[step.status.replace('-', '') as keyof typeof t] || step.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardContent className="p-4">
                <Textarea 
                  placeholder="Add private notes about this stakeholder..."
                  value={selectedStakeholderData.notes}
                  className="min-h-32"
                />
                <Button className="mt-3" size="sm">
                  {t.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel - Stakeholder List */}
      <div className="w-96 border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1>{t.stakeholderCRM}</h1>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t.addStakeholder}
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all} {t.type}</SelectItem>
                <SelectItem value="individual">{t.individual}</SelectItem>
                <SelectItem value="organization">{t.organization}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPipeline} onValueChange={setFilterPipeline}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all} {t.pipeline}</SelectItem>
                <SelectItem value="prospect">{t.prospect}</SelectItem>
                <SelectItem value="engaged">{t.engaged}</SelectItem>
                <SelectItem value="committed">{t.committed}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPillar} onValueChange={setFilterPillar}>
              <SelectTrigger className="h-8 text-xs col-span-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all} {t.pillar}</SelectItem>
                <SelectItem value="capital">{t.capital}</SelectItem>
                <SelectItem value="recognition">{t.recognition}</SelectItem>
                <SelectItem value="wellbeing">{t.wellbeing}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="font-medium text-slate-900">{stakeholders.length}</div>
              <div className="text-slate-600">{t.totalStakeholders}</div>
            </div>
            <div className="bg-blue-50 rounded p-2 text-center">
              <div className="font-medium text-blue-900">
                {stakeholders.filter(s => s.pipeline === 'engaged' || s.pipeline === 'committed').length}
              </div>
              <div className="text-blue-600">{t.activeEngagements}</div>
            </div>
            <div className="bg-orange-50 rounded p-2 text-center">
              <div className="font-medium text-orange-900">
                {stakeholders.reduce((acc, s) => acc + s.nextSteps.filter(ns => ns.status === 'pending').length, 0)}
              </div>
              <div className="text-orange-600">{t.pendingActions}</div>
            </div>
          </div>
        </div>

        {/* Stakeholder List */}
        <ScrollArea className="flex-1 p-4">
          {renderStakeholderList()}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {t.export}
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              {t.audit}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Detail View */}
      <div className="flex-1 overflow-y-auto">
        {selectedStakeholder ? (
          <div className="p-6">
            {renderStakeholderDetail()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Select a stakeholder to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Stakeholder Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.addStakeholder}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.name}</label>
              <Input placeholder="Enter name..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.email}</label>
              <Input placeholder="Enter email..." type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.type}</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">{t.individual}</SelectItem>
                  <SelectItem value="organization">{t.organization}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                {t.cancel}
              </Button>
              <Button className="flex-1">{t.save}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
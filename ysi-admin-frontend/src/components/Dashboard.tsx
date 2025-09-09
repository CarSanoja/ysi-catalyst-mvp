import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Calendar, Users, Clock, TrendingUp, Globe, CheckCircle, AlertCircle, FileText, Download, ExternalLink, Shield, BarChart3, Target, MessageSquare } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface DashboardProps {
  language: 'EN' | 'ES';
}

export function Dashboard({ language }: DashboardProps) {
  const text = {
    EN: {
      heroTitle: 'Youth & Social Innovation Initiative',
      heroSubtitle: 'This week at a glance',
      startSession: 'Start Session',
      keyMetrics: 'Key Metrics',
      sessionsMTD: 'Sessions (MTD)',
      voicesRepresented: 'Voices Represented',
      pillarCoverage: 'Pillar Coverage',
      actionItems: 'Action Items',
      avgTimeToSummary: 'Avg Time to Summary',
      representationBalance: 'Representation Balance',
      viewDetails: 'View details',
      recentActivity: 'Recent Activity',
      quickExports: 'Quick Exports',
      upcomingEvents: 'Upcoming Events',
      sessionToday: 'Session Today',
      sessionTime: '2:00 PM GMT',
      innovation: 'Innovation Workshop',
      leadership: 'Leadership Circle',
      impact: 'Impact Measurement',
      capital: 'Capital',
      recognition: 'Recognition',
      wellbeing: 'Wellbeing',
      closedVsOpen: 'closed vs open',
      uniqueLeaders: 'unique leaders',
      regions: 'regions',
      genderBalance: 'gender balance',
      regionalBalance: 'regional balance',
      executiveSummary: 'Executive Summary',
      slideDeck: 'Slide Deck',
      onePager: 'One-Pager',
      lastGenerated: 'Last generated',
      openInDrive: 'Open in Drive',
      consentReminder: 'Remember to respect consent and redaction settings before sharing outside the team.',
      minutes: 'min',
      ago: 'ago',
      flaggedContradiction: 'flagged contradiction',
      newAction: 'new action item',
      keyQuote: 'key quote'
    },
    ES: {
      heroTitle: 'Iniciativa de Innovación Social Juvenil',
      heroSubtitle: 'Esta semana de un vistazo',
      startSession: 'Iniciar Sesión',
      keyMetrics: 'Métricas Clave',
      sessionsMTD: 'Sesiones (MTD)',
      voicesRepresented: 'Voces Representadas',
      pillarCoverage: 'Cobertura de Pilares',
      actionItems: 'Elementos de Acción',
      avgTimeToSummary: 'Tiempo Promedio a Resumen',
      representationBalance: 'Balance de Representación',
      viewDetails: 'Ver detalles',
      recentActivity: 'Actividad Reciente',
      quickExports: 'Exportaciones Rápidas',
      upcomingEvents: 'Próximos Eventos',
      sessionToday: 'Sesión Hoy',
      sessionTime: '2:00 PM GMT',
      innovation: 'Taller de Innovación',
      leadership: 'Círculo de Liderazgo',
      impact: 'Medición de Impacto',
      capital: 'Capital',
      recognition: 'Reconocimiento',
      wellbeing: 'Bienestar',
      closedVsOpen: 'cerrados vs abiertos',
      uniqueLeaders: 'líderes únicos',
      regions: 'regiones',
      genderBalance: 'balance de género',
      regionalBalance: 'balance regional',
      executiveSummary: 'Resumen Ejecutivo',
      slideDeck: 'Presentación',
      onePager: 'Una Página',
      lastGenerated: 'Generado por última vez',
      openInDrive: 'Abrir en Drive',
      consentReminder: 'Recuerda respetar las configuraciones de consentimiento y redacción antes de compartir fuera del equipo.',
      minutes: 'min',
      ago: 'hace',
      flaggedContradiction: 'contradicción marcada',
      newAction: 'nuevo elemento de acción',
      keyQuote: 'cita clave'
    }
  };

  const t = text[language];

  // Mock data for team members
  const teamMembers = [
    { name: 'Sarah Chen', role: 'Program Director', image: '/images/team/1.png' },
    { name: 'Marcus Johnson', role: 'Innovation Lead', image: '/images/team/2.png' },
    { name: 'Elena Rodriguez', role: 'Community Manager', image: '/images/team/3.png' },
    { name: 'David Kim', role: 'Data Analyst', image: '/images/team/4.png' },
    { name: 'Ana Silva', role: 'Regional Coordinator', image: '/images/team/5.png' },
    { name: 'James Wright', role: 'Research Director', image: '/images/team/6.png' },
    { name: 'Priya Patel', role: 'Partnership Manager', image: '/images/team/7.png' },
    { name: 'Ahmed Hassan', role: 'Innovation Analyst', image: '/images/team/8.png' },
    { name: 'Lisa Thompson', role: 'Communications Lead', image: '/images/team/9.png' },
    { name: 'Sofia Martinez', role: 'Program Coordinator', image: '/images/team/10.png' },
    { name: 'Michael Chen', role: 'Technology Director', image: '/images/team/11.png' },
    { name: 'Fatima Al-Zahra', role: 'Impact Analyst', image: '/images/team/12.png' },
    { name: 'Carlos Mendez', role: 'Regional Lead', image: '/images/team/13.png' },
    { name: 'Jennifer Park', role: 'Strategy Manager', image: '/images/team/14.png' },
    { name: 'Alex Rivera', role: 'Youth Advocate', image: '/images/team/15.png' },
    { name: 'Nina Okonkwo', role: 'Community Engagement', image: '/images/team/16.png' }
  ];

  const recentGuests = [
    { name: 'Prof. Amanda Foster', affiliation: 'Stanford University' },
    { name: 'Dr. James Wright', affiliation: 'UN Sustainable Development' },
    { name: 'Maria Santos', affiliation: 'Acumen Academy' }
  ];

  // Mock data for activity feed
  const recentActivity = [
    {
      id: 1,
      type: 'quote',
      session: 'Social Impact Accelerator',
      time: '2h',
      content: '"We need to shift from charity mindset to investment mindset when supporting youth innovations."',
      speaker: 'Dr. James Wright'
    },
    {
      id: 2,
      type: 'contradiction',
      session: 'Regional Leadership Forum',
      time: '3h',
      content: 'Conflicting views on funding allocation between Asia-Pacific and Latin America representatives',
      flagged: true
    },
    {
      id: 3,
      type: 'action',
      session: 'Innovation Workshop',
      time: '5h',
      content: 'Create mentorship matching platform for 50+ youth leaders by Q2',
      assignee: 'Sarah Chen'
    },
    {
      id: 4,
      type: 'quote',
      session: 'Climate Innovation Summit',
      time: '1d',
      content: '"Local solutions with global impact - that\'s where youth excel."',
      speaker: 'Maria Santos'
    }
  ];

  // Mock data for exports
  const quickExports = [
    {
      type: 'executive',
      title: language === 'EN' ? 'Executive Summary (EN)' : 'Resumen Ejecutivo (EN)',
      lastGenerated: '2h ago',
      icon: FileText
    },
    {
      type: 'executive-es',
      title: language === 'EN' ? 'Executive Summary (ES)' : 'Resumen Ejecutivo (ES)',
      lastGenerated: '2h ago',
      icon: FileText
    },
    {
      type: 'slides',
      title: language === 'EN' ? 'Slide Deck' : 'Presentación',
      lastGenerated: '1d ago',
      icon: BarChart3
    },
    {
      type: 'onepager',
      title: language === 'EN' ? 'One-Pager' : 'Una Página',
      lastGenerated: '3h ago',
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div>
                <h1 className="mb-2">{t.heroTitle}</h1>
                <p className="text-slate-300">{t.heroSubtitle}</p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8">
                {t.startSession}
              </Button>
            </div>

            {/* Right: Team Photos Mosaic */}
            <div className="grid grid-cols-4 gap-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="group relative">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-700">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-white">
                      <p className="font-medium text-xs">{member.name}</p>
                      <p className="text-xs text-slate-300 truncate">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2>{t.keyMetrics}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Sessions MTD */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-3xl">23</p>
                  <p className="text-sm text-slate-600">{t.sessionsMTD}</p>
                </div>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <button className="text-xs text-blue-600 hover:underline">
                {t.viewDetails}
              </button>
            </CardContent>
          </Card>

          {/* Voices Represented */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-3xl">147</p>
                  <p className="text-sm text-slate-600">{t.voicesRepresented}</p>
                  <p className="text-xs text-slate-500">{`89 ${t.uniqueLeaders} • 23 ${t.regions}`}</p>
                </div>
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <button className="text-xs text-blue-600 hover:underline">
                {t.viewDetails}
              </button>
            </CardContent>
          </Card>

          {/* Pillar Coverage */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-full">
                  <p className="text-lg mb-2">{t.pillarCoverage}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{t.capital}</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-1.5" />
                    <div className="flex justify-between text-xs">
                      <span>{t.recognition}</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-1.5" />
                    <div className="flex justify-between text-xs">
                      <span>{t.wellbeing}</span>
                      <span>82%</span>
                    </div>
                    <Progress value={82} className="h-1.5" />
                  </div>
                </div>
              </div>
              <button className="text-xs text-blue-600 hover:underline">
                {t.viewDetails}
              </button>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-3xl">32<span className="text-lg text-slate-500">/45</span></p>
                  <p className="text-sm text-slate-600">{t.actionItems}</p>
                  <p className="text-xs text-slate-500">{t.closedVsOpen}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <button className="text-xs text-blue-600 hover:underline">
                {t.viewDetails}
              </button>
            </CardContent>
          </Card>

          {/* Average Time to Summary */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-3xl">18<span className="text-lg text-slate-500">m</span></p>
                  <p className="text-sm text-slate-600">{t.avgTimeToSummary}</p>
                </div>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <button className="text-xs text-blue-600 hover:underline">
                {t.viewDetails}
              </button>
            </CardContent>
          </Card>

          {/* Representation Balance */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-full">
                  <p className="text-lg mb-2">{t.representationBalance}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{t.genderBalance}</span>
                      <span>52%/48%</span>
                    </div>
                    <div className="flex h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="bg-blue-500 w-[52%]"></div>
                      <div className="bg-pink-500 w-[48%]"></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t.regionalBalance}</span>
                      <span>Balanced</span>
                    </div>
                  </div>
                </div>
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <button className="text-xs text-blue-600 hover:underline">
                {t.viewDetails}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Exports */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity Feed */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4">{t.recentActivity}</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="border-l-2 border-slate-200 pl-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        activity.type === 'quote' 
                          ? 'bg-blue-100' 
                          : activity.type === 'contradiction' 
                          ? 'bg-orange-100' 
                          : 'bg-green-100'
                      }`}>
                        {activity.type === 'quote' && <MessageSquare className="w-3 h-3 text-blue-600" />}
                        {activity.type === 'contradiction' && <AlertCircle className="w-3 h-3 text-orange-600" />}
                        {activity.type === 'action' && <CheckCircle className="w-3 h-3 text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{activity.session}</span>
                          <span className="text-xs text-slate-500">{activity.time} {t.ago}</span>
                          {activity.type === 'quote' && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {t.keyQuote}
                            </Badge>
                          )}
                          {activity.type === 'contradiction' && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0">
                              {t.flaggedContradiction}
                            </Badge>
                          )}
                          {activity.type === 'action' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {t.newAction}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700">{activity.content}</p>
                        {activity.speaker && (
                          <p className="text-xs text-slate-500 mt-1">— {activity.speaker}</p>
                        )}
                        {activity.assignee && (
                          <p className="text-xs text-slate-500 mt-1">Assigned to: {activity.assignee}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Exports */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4">{t.quickExports}</h3>
              <div className="space-y-3 mb-4">
                {quickExports.map((exportItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <exportItem.icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{exportItem.title}</p>
                        <p className="text-xs text-slate-500">{t.lastGenerated}: {exportItem.lastGenerated}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Consent Banner */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">{t.consentReminder}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4">{t.upcomingEvents}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{t.innovation}</p>
                  <p className="text-sm text-slate-600">{t.sessionToday} • {t.sessionTime}</p>
                </div>
                <Badge variant="secondary">Today</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{t.leadership}</p>
                  <p className="text-sm text-slate-600">Tomorrow • 3:00 PM GMT</p>
                </div>
                <Badge variant="outline">Tomorrow</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{t.impact}</p>
                  <p className="text-sm text-slate-600">Friday • 1:00 PM GMT</p>
                </div>
                <Badge variant="outline">Friday</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
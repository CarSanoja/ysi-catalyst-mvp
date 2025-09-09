import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
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
      weeklyStats: 'Weekly Overview',
      totalSessions: 'Total Sessions',
      activeParticipants: 'Active Participants',
      avgDuration: 'Avg Duration',
      engagementRate: 'Engagement Rate',
      recentSessions: 'Recent Sessions',
      upcomingEvents: 'Upcoming Events',
      teamMembers: 'Team Members',
      sessionToday: 'Session Today',
      sessionTime: '2:00 PM GMT',
      innovation: 'Innovation Workshop',
      leadership: 'Leadership Circle',
      impact: 'Impact Measurement'
    },
    ES: {
      heroTitle: 'Iniciativa de Innovación Social Juvenil',
      heroSubtitle: 'Esta semana de un vistazo',
      startSession: 'Iniciar Sesión',
      weeklyStats: 'Resumen Semanal',
      totalSessions: 'Sesiones Totales',
      activeParticipants: 'Participantes Activos',
      avgDuration: 'Duración Promedio',
      engagementRate: 'Tasa de Participación',
      recentSessions: 'Sesiones Recientes',
      upcomingEvents: 'Próximos Eventos',
      teamMembers: 'Miembros del Equipo',
      sessionToday: 'Sesión Hoy',
      sessionTime: '2:00 PM GMT',
      innovation: 'Taller de Innovación',
      leadership: 'Círculo de Liderazgo',
      impact: 'Medición de Impacto'
    }
  };

  const t = text[language];

  // Mock data for team members
  const teamMembers = [
    { name: 'Sarah Chen', role: 'Program Director', image: '/images/team/1.png' },
    { name: 'Marcus Johnson', role: 'Innovation Lead', image: '/images/team/2.png' },
    { name: 'Elena Rodriguez', role: 'Community Manager', image: '/images/team/3.png' },
    { name: 'David Kim', role: 'Data Analyst', image: '/images/team/4.png' },
  ];

  const recentGuests = [
    { name: 'Prof. Amanda Foster', affiliation: 'Stanford University' },
    { name: 'Dr. James Wright', affiliation: 'UN Sustainable Development' },
    { name: 'Maria Santos', affiliation: 'Acumen Academy' }
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {teamMembers.slice(0, 2).map((member, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-700">
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="text-white">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-slate-300">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-8">
                {teamMembers.slice(2, 4).map((member, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-700">
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="text-white">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-slate-300">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2>{t.weeklyStats}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium">12</p>
                  <p className="text-sm text-slate-600">{t.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium">284</p>
                  <p className="text-sm text-slate-600">{t.activeParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium">45m</p>
                  <p className="text-sm text-slate-600">{t.avgDuration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium">94%</p>
                  <p className="text-sm text-slate-600">{t.engagementRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Upcoming */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4">{t.upcomingEvents}</h3>
              <div className="space-y-4">
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

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4">Recent Guests</h3>
              <div className="space-y-4">
                {recentGuests.map((guest, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {guest.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-slate-600">{guest.affiliation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
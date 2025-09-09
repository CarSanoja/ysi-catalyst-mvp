import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { BarChart3, Home, Mic, Lightbulb, Users, Calendar, FileText, Brain, LogOut, Upload } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  language: 'EN' | 'ES';
  onLogout: () => void;
}

export function Sidebar({ currentView, onViewChange, language, onLogout }: SidebarProps) {
  const text = {
    EN: {
      dashboard: 'Dashboard',
      liveCapture: 'Live Capture',
      insights: 'Insights',
      charterBuilder: 'Charter Builder',
      knowledgeBase: 'Knowledge Base',
      manualCapture: 'Manual Capture',
      sessions: 'Sessions',
      stakeholders: 'Stakeholders',
      logout: 'Logout'
    },
    ES: {
      dashboard: 'Panel Principal',
      liveCapture: 'Captura en Vivo',
      insights: 'Perspectivas',
      charterBuilder: 'Constructor de Carta',
      knowledgeBase: 'Base de Conocimiento',
      manualCapture: 'Captura Manual',
      sessions: 'Sesiones',
      stakeholders: 'Interesados',
      logout: 'Cerrar Sesión'
    }
  };

  const t = text[language];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'live-capture', label: t.liveCapture, icon: Mic },
    { id: 'manual-capture', label: t.manualCapture, icon: Upload },
    { id: 'insights', label: t.insights, icon: Lightbulb },
    { id: 'charter-builder', label: t.charterBuilder, icon: FileText },
    { id: 'knowledge-base', label: t.knowledgeBase, icon: Brain },
    { id: 'sessions', label: t.sessions, icon: Calendar },
    { id: 'stakeholders', label: t.stakeholders, icon: Users },
  ];

  const isActive = (itemId: string) => currentView === itemId;

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Logo/Brand Area */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">Global Shapers</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={isActive(item.id) ? "secondary" : "ghost"}
                className={`w-full justify-start h-10 ${
                  isActive(item.id) 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          {t.logout}
        </Button>
      </nav>

      {/* Session Status Indicator */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-600">
            {language === 'EN' ? 'Session Active' : 'Sesión Activa'}
          </span>
        </div>
      </div>
    </div>
  );
}
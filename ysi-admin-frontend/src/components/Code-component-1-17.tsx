import { Button } from "./ui/button";

interface LanguageToggleProps {
  language: 'EN' | 'ES';
  onToggle: (lang: 'EN' | 'ES') => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
      <Button
        variant={language === 'EN' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('EN')}
        className={`h-7 px-3 ${
          language === 'EN' 
            ? 'bg-white text-slate-900 hover:bg-white/90' 
            : 'text-white hover:bg-white/10 hover:text-white'
        }`}
      >
        EN
      </Button>
      <Button
        variant={language === 'ES' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('ES')}
        className={`h-7 px-3 ${
          language === 'ES' 
            ? 'bg-white text-slate-900 hover:bg-white/90' 
            : 'text-white hover:bg-white/10 hover:text-white'
        }`}
      >
        ES
      </Button>
    </div>
  );
}
import { useMemo } from 'react';
import { GlobalShaper } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Target, Loader2, AlertCircle } from 'lucide-react';

interface ShapersDashboardProps {
  shapers: GlobalShaper[];
  loading?: boolean;
  error?: Error | null;
}

/**
 * Fisher-Yates shuffle algorithm for true randomization
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function ShapersDashboard({ shapers, loading, error }: ShapersDashboardProps) {
  // Shuffle shapers array on mount and when shapers data changes
  const shuffledShapers = useMemo(() => {
    return shuffleArray(shapers);
  }, [shapers]);
  const getFocusAreaColor = (focusArea: string) => {
    switch (focusArea) {
      case 'Capital Access':
        return 'bg-[#0077B6] text-white';
      case 'Recognition':
        return 'bg-[#C3B1E1] text-[#2C3E50]';
      case 'Wellbeing':
        return 'bg-[#A8E6CF] text-[#2C3E50]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-muted-foreground">
            Loading Global Shapers...
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0077B6' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-muted-foreground">
            Error loading Global Shapers
          </p>
        </div>
        <Card className="p-8 text-center bg-red-50 border-red-200">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-700 mb-2">Failed to load Global Shapers</p>
          <p className="text-sm text-red-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-muted-foreground">
          Meet the {shuffledShapers.length} youth leaders co-creating the Youth & Social Innovation Charter
        </p>
      </div>

      {shuffledShapers.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#0077B6' }} />
          <p className="text-muted-foreground">No Global Shapers found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shuffledShapers.map((shaper) => (
          <Card
            key={shaper.id}
            className="overflow-hidden bg-white border-2 border-border hover:border-[#0077B6] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#E8F1F9] to-[#89CFF0]/30 shrink-0">
                <ImageWithFallback
                  src={shaper.photo}
                  alt={shaper.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="truncate">{shaper.name}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{shaper.region}</span>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-2">
              <Badge className={`${getFocusAreaColor(shaper.focusArea)} w-full justify-center gap-1`}>
                <Target className="w-3 h-3" />
                {shaper.focusArea}
              </Badge>

              <p className="text-sm text-muted-foreground line-clamp-2">{shaper.bio}</p>
            </div>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}

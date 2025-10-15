import { useState } from 'react';
import { Stakeholder } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Users, TrendingUp } from 'lucide-react';

interface StakeholderMapProps {
  stakeholders: Stakeholder[];
}

export function StakeholderMap({ stakeholders }: StakeholderMapProps) {
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  // Get connections for selected stakeholder
  const getConnections = (stakeholder: Stakeholder) => {
    return stakeholders.filter(s => stakeholder.relationships.includes(s.id));
  };

  const typeColors = {
    innovator: 'bg-blue-500',
    funder: 'bg-green-500',
    partner: 'bg-purple-500',
    mentor: 'bg-orange-500',
    policymaker: 'bg-red-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Map Visualization */}
      <Card className="lg:col-span-2 p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5" />
          <h3>Global Stakeholder Network</h3>
        </div>
        
        {/* Simplified world map representation */}
        <div className="relative w-full h-[400px] bg-muted/30 rounded-lg border border-border overflow-hidden">
          {/* SVG World Map Simplified */}
          <svg viewBox="0 0 1000 500" className="w-full h-full opacity-10">
            <path d="M 100 100 Q 200 80 300 100 T 500 100 Q 600 90 700 110 T 900 100 L 900 400 Q 800 390 700 400 T 500 400 Q 400 410 300 400 T 100 400 Z" fill="currentColor" />
          </svg>
          
          {/* Stakeholder Pins */}
          {stakeholders.map((stakeholder) => {
            // Convert lat/lng to SVG coordinates (simplified projection)
            const x = ((stakeholder.location.lng + 180) / 360) * 100;
            const y = ((90 - stakeholder.location.lat) / 180) * 100;
            
            const isSelected = selectedStakeholder?.id === stakeholder.id;
            const isConnected = selectedStakeholder?.relationships.includes(stakeholder.id);
            
            return (
              <div
                key={stakeholder.id}
                className="absolute cursor-pointer group"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={() => setSelectedStakeholder(stakeholder)}
              >
                {/* Connection lines */}
                {isSelected && stakeholder.relationships.map(relId => {
                  const relStakeholder = stakeholders.find(s => s.id === relId);
                  if (!relStakeholder) return null;
                  
                  const relX = ((relStakeholder.location.lng + 180) / 360) * 100;
                  const relY = ((90 - relStakeholder.location.lat) / 180) * 100;
                  
                  return (
                    <svg
                      key={relId}
                      className="absolute pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: '1000px',
                        height: '500px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <line
                        x1="500"
                        y1="250"
                        x2={500 + (relX - x) * 10}
                        y2={250 + (relY - y) * 10}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="text-primary/30"
                      />
                    </svg>
                  );
                })}
                
                {/* Pin */}
                <div className={`w-4 h-4 rounded-full ${typeColors[stakeholder.type]} border-2 border-white transition-all ${
                  isSelected ? 'scale-150' : isConnected ? 'scale-125' : 'scale-100'
                } group-hover:scale-150`} />
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground p-2 rounded shadow-lg whitespace-nowrap z-10 border border-border">
                  <p className="text-sm">{stakeholder.name}</p>
                  <p className="text-xs text-muted-foreground">{stakeholder.city}, {stakeholder.country}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm capitalize">{type}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stakeholder Details */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3>Stakeholder Details</h3>
        </div>
        
        {selectedStakeholder ? (
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Name</p>
              <p>{selectedStakeholder.name}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm mb-1">Organization</p>
              <p>{selectedStakeholder.organization}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm mb-1">Type</p>
              <Badge variant="secondary" className="capitalize">{selectedStakeholder.type}</Badge>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm mb-1">Location</p>
              <p>{selectedStakeholder.location.city}, {selectedStakeholder.location.country}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm mb-1">Focus Pillars</p>
              <div className="flex flex-wrap gap-2">
                {selectedStakeholder.pillars.map(pillar => (
                  <Badge key={pillar} variant="outline" className="capitalize">{pillar}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm mb-1">Engagement Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${selectedStakeholder.engagementScore}%` }}
                  />
                </div>
                <span>{selectedStakeholder.engagementScore}%</span>
              </div>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm mb-1">Connections ({selectedStakeholder.relationships.length})</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getConnections(selectedStakeholder).map(connection => (
                  <div 
                    key={connection.id}
                    className="p-2 bg-muted/50 rounded text-sm cursor-pointer hover:bg-muted"
                    onClick={() => setSelectedStakeholder(connection)}
                  >
                    <p>{connection.name}</p>
                    <p className="text-xs text-muted-foreground">{connection.organization}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a stakeholder on the map to view details</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

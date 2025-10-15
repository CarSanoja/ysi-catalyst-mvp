import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { PlusCircle, X, Save, FileText } from 'lucide-react';
import { Stakeholder } from '../types';
import { toast } from 'sonner@2.0.3';

interface ManualCaptureProps {
  stakeholders: Stakeholder[];
}

export function ManualCapture({ stakeholders }: ManualCaptureProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [newTheme, setNewTheme] = useState('');
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(['']);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');

  const pillars = ['capital', 'recognition', 'wellbeing'];

  const handleAddTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim()]);
      setNewTheme('');
    }
  };

  const handleRemoveTheme = (theme: string) => {
    setThemes(themes.filter(t => t !== theme));
  };

  const handleAddTakeaway = () => {
    setKeyTakeaways([...keyTakeaways, '']);
  };

  const handleUpdateTakeaway = (index: number, value: string) => {
    const updated = [...keyTakeaways];
    updated[index] = value;
    setKeyTakeaways(updated);
  };

  const handleRemoveTakeaway = (index: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }
    if (selectedParticipants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }
    
    // Here you would typically save to a database
    const meetingData = {
      title,
      date,
      participants: selectedParticipants,
      themes,
      pillars: selectedPillars,
      notes,
      keyTakeaways: keyTakeaways.filter(t => t.trim()),
      sentiment,
    };
    
    console.log('Saving meeting:', meetingData);
    toast.success('Meeting notes captured successfully!');
    
    // Reset form
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setSelectedParticipants([]);
    setThemes([]);
    setSelectedPillars([]);
    setKeyTakeaways(['']);
    setSentiment('neutral');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5" />
        <h3>Manual Capture - Meeting Notes</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Capital Access Workshop"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Participants */}
        <div>
          <Label>Participants *</Label>
          <div className="mt-2 max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3">
            {stakeholders.map(stakeholder => (
              <div key={stakeholder.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`participant-${stakeholder.id}`}
                  checked={selectedParticipants.includes(stakeholder.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedParticipants([...selectedParticipants, stakeholder.id]);
                    } else {
                      setSelectedParticipants(selectedParticipants.filter(id => id !== stakeholder.id));
                    }
                  }}
                />
                <label
                  htmlFor={`participant-${stakeholder.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {stakeholder.name} - {stakeholder.organization}
                </label>
              </div>
            ))}
          </div>
          {selectedParticipants.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Themes */}
        <div>
          <Label htmlFor="themes">Themes</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="themes"
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              placeholder="e.g., funding mechanisms"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTheme();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddTheme}>
              <PlusCircle className="w-4 h-4" />
            </Button>
          </div>
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {themes.map(theme => (
                <Badge key={theme} variant="secondary" className="gap-1">
                  {theme}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleRemoveTheme(theme)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Pillars */}
        <div>
          <Label>Focus Pillars</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {pillars.map(pillar => (
              <div key={pillar} className="flex items-center space-x-2">
                <Checkbox
                  id={`pillar-${pillar}`}
                  checked={selectedPillars.includes(pillar)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPillars([...selectedPillars, pillar]);
                    } else {
                      setSelectedPillars(selectedPillars.filter(p => p !== pillar));
                    }
                  }}
                />
                <label
                  htmlFor={`pillar-${pillar}`}
                  className="text-sm cursor-pointer capitalize"
                >
                  {pillar}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Meeting Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Capture key discussion points, decisions made, and context..."
            className="mt-1 min-h-32"
          />
        </div>

        {/* Key Takeaways */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Key Takeaways</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddTakeaway}>
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Takeaway
            </Button>
          </div>
          <div className="space-y-2">
            {keyTakeaways.map((takeaway, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={takeaway}
                  onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
                  placeholder="e.g., Simplify grant application processes"
                />
                {keyTakeaways.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveTakeaway(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment */}
        <div>
          <Label htmlFor="sentiment">Overall Sentiment</Label>
          <Select value={sentiment} onValueChange={(value: any) => setSentiment(value)}>
            <SelectTrigger id="sentiment" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Meeting Notes
        </Button>
      </form>
    </Card>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, FileText, Users, BarChart3, CheckCircle2, AlertCircle, Lightbulb, Clock, X, Pause } from 'lucide-react';
import { ExtractedInsight } from '../types';
import { toast } from 'sonner@2.0.3';
import { useProcessNotes, useProcessingJob, useCancelProcessingJob } from '../hooks/useApi';

export function CaptureNotes() {
  const [noteText, setNoteText] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [extractedInsight, setExtractedInsight] = useState<ExtractedInsight | null>(null);

  // Hooks
  const processNotes = useProcessNotes();
  const { data: jobData, refetch: refetchJob } = useProcessingJob(currentJobId || '');
  const cancelJob = useCancelProcessingJob();

  // Status tracking
  const jobStatus = jobData?.status || null;
  const isWaiting = jobStatus === 'received';
  const isProcessing = jobStatus === 'processing';
  const isCompleted = jobStatus === 'completed';
  const isError = jobStatus === 'error';
  const isCancelled = jobStatus === 'cancelled';

  // Polling effect for job status
  useEffect(() => {
    if (currentJobId && (isWaiting || isProcessing)) {
      const interval = setInterval(() => {
        refetchJob();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentJobId, isWaiting, isProcessing, refetchJob]);

  // Handle job completion
  useEffect(() => {
    if (isCompleted && jobData?.result) {
      const result = jobData.result;

      // Convert job result to ExtractedInsight format
      const insight: ExtractedInsight = {
        id: `insight-${jobData.id}`,
        mainTheme: result.themes_identified?.[0] || 'General Theme',
        subthemes: result.themes_identified || [],
        keyActors: result.participants_mentioned || [],
        generalPerception: result.sentiment_analysis?.overall_sentiment || 'neutral',
        proposedActions: result.action_items || [],
        challenges: result.challenges || [],
        opportunities: result.opportunities || [],
        rawText: jobData.input_text,
        extractedAt: jobData.completed_at,
      };

      setExtractedInsight(insight);
      toast.success('Insights extracted successfully!');
    } else if (isError) {
      toast.error(`Processing failed: ${jobData?.error_message || 'Unknown error'}`);
      setCurrentJobId(null);
    } else if (isCancelled) {
      toast.info('Processing job was cancelled');
      setCurrentJobId(null);
    }
  }, [isCompleted, isError, isCancelled, jobData]);

  const handleSubmit = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter some notes to process');
      return;
    }

    try {
      const result = await processNotes.mutate({
        text: noteText,
        context: 'User note capture session'
      });

      setCurrentJobId(result.id.toString());
      toast.success('Processing job created! Tracking status...');
    } catch (error) {
      toast.error('Failed to create processing job');
    }
  };

  const handleCancel = async () => {
    if (!currentJobId) return;

    try {
      await cancelJob.mutate(currentJobId);
      setCurrentJobId(null);
      toast.info('Processing job cancelled');
    } catch (error) {
      toast.error('Failed to cancel job');
    }
  };

  const handleSave = () => {
    toast.success('Insights saved to Processed Documents');
    setNoteText('');
    setExtractedInsight(null);
    setCurrentJobId(null);
  };

  const handleClear = () => {
    setNoteText('');
    setExtractedInsight(null);
    setCurrentJobId(null);
  };

  const getStatusDisplay = () => {
    if (!currentJobId) return null;

    const statusConfig = {
      received: {
        icon: Clock,
        text: 'Recibido',
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        description: 'Tu texto ha sido recibido y está en cola para procesamiento'
      },
      processing: {
        icon: Loader2,
        text: 'En Proceso',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        description: 'IA está analizando tu texto y extrayendo insights'
      },
      completed: {
        icon: CheckCircle2,
        text: 'Completado',
        color: 'bg-green-100 text-green-700 border-green-300',
        description: 'Procesamiento completado exitosamente'
      },
      error: {
        icon: AlertCircle,
        text: 'Error',
        color: 'bg-red-100 text-red-700 border-red-300',
        description: 'Ocurrió un error durante el procesamiento'
      },
      cancelled: {
        icon: X,
        text: 'Cancelado',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        description: 'El procesamiento fue cancelado'
      }
    };

    const config = statusConfig[jobStatus as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Card className={`p-4 border-2 ${config.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{config.text}</span>
                {jobData && (
                  <Badge variant="outline" className="text-xs">
                    ID: {jobData.id}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
          </div>

          {(isWaiting || isProcessing) && (
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={cancelJob.loading}
            >
              {cancelJob.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" style={{ color: '#0077B6' }} />
          <h3 style={{ color: '#0077B6' }}>Capture Meeting Notes</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Paste or type meeting notes, observations, or discussion summaries below. Our AI will automatically extract key insights.
        </p>

        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Example: Today's workshop focused on capital access challenges in the Asia-Pacific region. Amara Chen highlighted the complexity of grant applications, particularly for first-time applicants. Priya Sharma emphasized the need for structured mentorship during funding cycles..."
          className="min-h-[300px] mb-4 bg-white border-[#E0E0E0] focus:border-[#0077B6] resize-none"
          disabled={isWaiting || isProcessing}
        />

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={(isWaiting || isProcessing) || !noteText.trim() || processNotes.loading}
            className="flex-1 bg-[#0077B6] hover:bg-[#005a8c]"
          >
            {processNotes.loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Job...
              </>
            ) : (isWaiting || isProcessing) ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Extract Insights
              </>
            )}
          </Button>

          {(extractedInsight || currentJobId) && (
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Status Display */}
      {getStatusDisplay()}

      {/* Insights Display */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5" style={{ color: '#0077B6' }} />
          <h3 style={{ color: '#0077B6' }}>Extracted Insights</h3>
        </div>

        {!extractedInsight ? (
          <Card className="p-12 bg-white text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#0077B6' }} />
            <p className="text-muted-foreground">
              Insights will appear here after processing your notes
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Main Theme */}
            <Card className="p-4 bg-gradient-to-br from-[#89CFF0]/20 to-[#0077B6]/10 border-2 border-[#0077B6]/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#0077B6] rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Main Theme</p>
                  <h4>{extractedInsight.mainTheme}</h4>
                </div>
              </div>
            </Card>

            {/* Subthemes */}
            <Card className="p-4 bg-gradient-to-br from-[#C3B1E1]/20 to-[#C3B1E1]/10 border-2 border-[#C3B1E1]/50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#C3B1E1] rounded-lg">
                  <BarChart3 className="w-4 h-4 text-[#2C3E50]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Subthemes</p>
                  <div className="flex flex-wrap gap-2">
                    {extractedInsight.subthemes.map((theme, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-[#C3B1E1]/30">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Actors */}
            <Card className="p-4 bg-gradient-to-br from-[#A8E6CF]/20 to-[#A8E6CF]/10 border-2 border-[#A8E6CF]/50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#A8E6CF] rounded-lg">
                  <Users className="w-4 h-4 text-[#2C3E50]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Key Actors</p>
                  <div className="flex flex-wrap gap-2">
                    {extractedInsight.keyActors.map((actor, idx) => (
                      <Badge key={idx} variant="outline" className="border-[#A8E6CF] bg-white">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* General Perception */}
            <Card className="p-4 bg-gradient-to-br from-[#FFD3B6]/20 to-[#FFD3B6]/10 border-2 border-[#FFD3B6]/50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#FFD3B6] rounded-lg">
                  {extractedInsight.generalPerception === 'positive' && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                  {extractedInsight.generalPerception === 'neutral' && (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  {extractedInsight.generalPerception === 'negative' && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">General Perception</p>
                  <Badge
                    variant="secondary"
                    className={`capitalize ${
                      extractedInsight.generalPerception === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : extractedInsight.generalPerception === 'neutral'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {extractedInsight.generalPerception}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Proposed Actions */}
            <Card className="p-4 bg-gradient-to-br from-[#89CFF0]/20 to-white border-2 border-[#89CFF0]/50">
              <p className="text-sm mb-2" style={{ color: '#0077B6' }}>
                Proposed Actions
              </p>
              <ul className="space-y-2">
                {extractedInsight.proposedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#0077B6' }} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Challenges */}
            <Card className="p-4 bg-gradient-to-br from-[#FF6B6B]/10 to-white border-2 border-[#FF6B6B]/30">
              <p className="text-sm mb-2" style={{ color: '#FF6B6B' }}>
                Challenges
              </p>
              <ul className="space-y-2">
                {extractedInsight.challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FF6B6B' }} />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Opportunities */}
            <Card className="p-4 bg-gradient-to-br from-[#A8E6CF]/20 to-white border-2 border-[#A8E6CF]/50">
              <p className="text-sm mb-2 text-green-700">Opportunities</p>
              <ul className="space-y-2">
                {extractedInsight.opportunities.map((opportunity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full bg-[#0077B6] hover:bg-[#005a8c]">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save to Processed Documents
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

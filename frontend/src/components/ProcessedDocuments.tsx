import { useMemo, useState } from 'react';
import { ProcessedDocument, NetworkAnalysis, NetworkStakeholder, NetworkRelationship, DocumentEdit } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ChangeHistoryModal } from './ui/change-history-modal';
import { api } from '../services/api';
import {
  FileText,
  Calendar,
  User,
  Smile,
  Meh,
  Frown,
  ArrowLeft,
  Sparkles,
  Users,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  Network,
  FileSearch,
  Loader2,
  History,
  Edit,
  Check,
  X,
  Link,
  Download,
} from 'lucide-react';
import { InsightWithEvidence } from './insights/InsightWithEvidence';
import { exportDocument } from '../utils/documentExport';

type InsightFieldKey =
  | 'title'
  | 'mainTheme'
  | 'keyActors'
  | 'proposedActions'
  | 'challenges'
  | 'opportunities'
  | 'meetingDate'
  | 'attendingShapers'
  | 'googleDocsLink';

const ARRAY_FIELDS: InsightFieldKey[] = ['keyActors', 'proposedActions', 'challenges', 'opportunities', 'attendingShapers'];

const AVAILABLE_SHAPERS = [
  'Kenneth Kwok', 'Maria Rodriguez', 'David Chen', 'Sarah Johnson', 'Alex Thompson',
  'Priya Patel', 'John Smith', 'Emma Wilson', 'Michael Brown', 'Lisa Anderson',
  'Carlos Mendez', 'Anna Kowalski', 'Ahmed Hassan', 'Sophie Laurent', 'Diego Martinez'
];

interface ProcessedDocumentsProps {
  documents: ProcessedDocument[];
  loading?: boolean;
  error?: Error | null;
}

export function ProcessedDocuments({ documents, loading, error }: ProcessedDocumentsProps) {
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [viewMode, setViewMode] = useState<'analytics' | 'raw'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState<'session' | 'text_processing_job'>('text_processing_job');

  // Edit mode state - controls which sections are being edited
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string | string[]}>({});
  const [isSaving, setIsSaving] = useState(false);

  const fieldLabels = useMemo(
    () => ({
      title: 'Document Title',
      mainTheme: 'Main Theme',
      keyActors: 'Key Actors',
      proposedActions: 'Proposed Actions',
      challenges: 'Challenges',
      opportunities: 'Opportunities',
      meetingDate: 'Meeting Date',
      attendingShapers: 'Attending Shapers',
      googleDocsLink: 'Google Docs Link',
    }),
    [],
  );

  const originalFieldValues = useMemo(() => {
    if (!selectedDocument) {
      return null;
    }

    return {
      title: selectedDocument.title,
      mainTheme: selectedDocument.insights.mainTheme,
      keyActors: selectedDocument.insights.keyActors ?? [],
      proposedActions: selectedDocument.insights.proposedActions ?? [],
      challenges: selectedDocument.insights.challenges ?? [],
      opportunities: selectedDocument.insights.opportunities ?? [],
      meetingDate: selectedDocument.insights.meetingDate ?? selectedDocument.meetingDate ?? '',
      attendingShapers: selectedDocument.insights.attendingShapers ?? selectedDocument.attendingShapers ?? [],
      googleDocsLink: selectedDocument.insights.googleDocsLink ?? selectedDocument.googleDocsLink ?? '',
    };
  }, [selectedDocument]);

  const applyOptimisticUpdate = (updates: DocumentEdit) => {
    setSelectedDocument((prev) => {
      if (!prev) return prev;

      const newInsights = { ...prev.insights };
      if (updates.insights) {
        Object.assign(newInsights, updates.insights);
      }

      return {
        ...prev,
        insights: newInsights,
        title: updates.insights?.title ?? prev.title,
        mainTheme: updates.insights?.mainTheme ?? prev.mainTheme,
        meetingDate: updates.insights?.meetingDate ?? prev.meetingDate,
        attendingShapers: updates.insights?.attendingShapers ?? prev.attendingShapers,
        googleDocsLink: updates.insights?.googleDocsLink ?? prev.googleDocsLink,
      };
    });
  };

  // Edit handlers
  const handleUpdateDocument = async (documentId: string, updates: DocumentEdit) => {
    if (!selectedDocument) return;

    const attemptUpdate = async (targetType: 'text_processing_job' | 'session') => {
      if (targetType === 'text_processing_job') {
        await api.notes.updateProcessingJobDocument(documentId, updates);
      } else {
        await api.notes.updateSession(documentId, updates);
      }
    };

    const isTextProcessingJob = documentType === 'text_processing_job';

    try {
      await attemptUpdate(isTextProcessingJob ? 'text_processing_job' : 'session');
      applyOptimisticUpdate(updates);
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? (error as { status?: number }).status
        : undefined;

      if (isTextProcessingJob && status === 404) {
        try {
          await attemptUpdate('session');
          setDocumentType('session');
          applyOptimisticUpdate(updates);
          return;
        } catch (fallbackError) {
          console.error('Fallback session update failed:', fallbackError);
          throw fallbackError instanceof Error ? fallbackError : new Error('Failed to update document via session fallback');
        }
      }

      console.error('Failed to update document:', error);
      throw error instanceof Error ? error : new Error('Failed to update document');
    }
  };

  // Start editing a field
  const startEditing = (field: string, currentValue: string | string[]) => {
    const typedField = field as InsightFieldKey;
    const isArrayField = ARRAY_FIELDS.includes(typedField);
    const valueToSet = Array.isArray(currentValue)
      ? [...currentValue]
      : isArrayField
        ? []
        : typeof currentValue === 'string'
          ? currentValue
          : '';

    setEditingField(field);
    setEditValues({ [field]: valueToSet });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({});
  };

  // Save field changes
  const saveField = async (field: InsightFieldKey) => {
    if (!selectedDocument) return;

    const pendingValue = editValues[field];
    if (pendingValue === undefined) return;

    const normalizedValue = Array.isArray(pendingValue)
      ? Array.from(new Set(pendingValue.map((item) => item.trim()).filter((item) => item.length > 0)))
      : typeof pendingValue === 'string'
        ? pendingValue.trim()
        : pendingValue;

    // Avoid sending updates if nothing changed after normalization
    const currentValue = (() => {
      if (!selectedDocument) return undefined;
      switch (field) {
        case 'title':
          return selectedDocument.title;
        case 'mainTheme':
          return selectedDocument.insights.mainTheme;
        case 'keyActors':
          return selectedDocument.insights.keyActors;
        case 'proposedActions':
          return selectedDocument.insights.proposedActions;
        case 'challenges':
          return selectedDocument.insights.challenges;
        case 'opportunities':
          return selectedDocument.insights.opportunities;
        case 'meetingDate':
          return selectedDocument.meetingDate;
        case 'attendingShapers':
          return selectedDocument.attendingShapers;
        case 'googleDocsLink':
          return selectedDocument.googleDocsLink;
        default:
          return undefined;
      }
    })();

    const isUnchanged = (() => {
      if (Array.isArray(normalizedValue)) {
        const originalArray = Array.isArray(currentValue) ? currentValue : [];
        const normalizedOriginal = Array.from(
          new Set(originalArray.map((item) => item.trim()).filter((item) => item.length > 0)),
        );
        return JSON.stringify(normalizedValue) === JSON.stringify(normalizedOriginal);
      }
      if (typeof normalizedValue === 'string' && typeof currentValue === 'string') {
        return normalizedValue === currentValue.trim();
      }
      return false;
    })();

    if (isUnchanged) {
      setEditingField(null);
      setEditValues({});
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload = (() => {
        const baseUpdate = {
          changed_by: 'admin_user', // TODO: Replace with actual user
          change_reason: `Updated ${field}`,
        };

        // Title and new fields go in insights, same as other insight fields
        return { ...baseUpdate, insights: { [field]: normalizedValue } };
      })();

      await handleUpdateDocument(selectedDocument.id, updatePayload);
      setEditingField(null);
      setEditValues({});
    } catch (error) {
      console.error('Failed to save field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-5 h-5 text-green-600" />;
      case 'neutral':
        return <Meh className="w-5 h-5 text-yellow-600" />;
      case 'negative':
        return <Frown className="w-5 h-5 text-red-600" />;
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'negative':
        return 'bg-red-100 text-red-700 border-red-300';
    }
  };

  // Handlers for new fields
  const handleMeetingDateSave = async (newDate: string) => {
    if (!selectedDocument) return;
    await handleUpdateDocument(selectedDocument.id, {
      meetingDate: newDate,
      changed_by: 'admin',
      change_reason: 'Updated meeting date'
    });
    setSelectedDocument(prev => prev ? { ...prev, meetingDate: newDate } : null);
  };

  const handleAttendingShapersChange = async (newShapers: string[]) => {
    if (!selectedDocument) return;
    await handleUpdateDocument(selectedDocument.id, {
      attendingShapers: newShapers,
      changed_by: 'admin',
      change_reason: 'Updated attending shapers'
    });
    setSelectedDocument(prev => prev ? { ...prev, attendingShapers: newShapers } : null);
  };

  const handleGoogleDocsLinkSave = async (newLink: string) => {
    if (!selectedDocument) return;
    await handleUpdateDocument(selectedDocument.id, {
      googleDocsLink: newLink,
      changed_by: 'admin',
      change_reason: 'Updated Google Docs link'
    });
    setSelectedDocument(prev => prev ? { ...prev, googleDocsLink: newLink } : null);
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.mainTheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 style={{ color: '#0077B6' }}>Processed Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Loading documents...
            </p>
          </div>
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 style={{ color: '#0077B6' }}>Processed Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Error loading documents
            </p>
          </div>
        </div>
        <Card className="p-8 text-center bg-red-50 border-red-200">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-700 mb-2">Failed to load documents</p>
          <p className="text-sm text-red-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (selectedDocument) {
    const editingDisplayLabel = editingField
      ? fieldLabels[editingField as InsightFieldKey] ?? editingField
      : null;

    const currentEditValue = editingField ? editValues[editingField] : undefined;
    const originalValue =
      editingField && originalFieldValues
        ? originalFieldValues[editingField as InsightFieldKey]
        : undefined;

    const hasPendingChanges = (() => {
      if (!editingField) return false;
      if (currentEditValue === undefined) return false;

      if (Array.isArray(currentEditValue)) {
        const normalizedNew = Array.from(
          new Set(currentEditValue.map((item) => item.trim()).filter((item) => item.length > 0)),
        );
        const originalArray = Array.isArray(originalValue)
          ? Array.from(new Set(originalValue.map((item) => item.trim()).filter((item) => item.length > 0)))
          : [];
        return JSON.stringify(normalizedNew) !== JSON.stringify(originalArray);
      }

      if (typeof currentEditValue === 'string') {
        const normalizedOriginal =
          typeof originalValue === 'string' ? originalValue.trim() : '';
        return currentEditValue.trim() !== normalizedOriginal;
      }

      return false;
    })();

    const isCurrentValueValid = (() => {
      if (!editingField) return false;
      if (currentEditValue === undefined) return false;

      if (Array.isArray(currentEditValue)) {
        return true;
      }

      if (typeof currentEditValue === 'string') {
        return currentEditValue.trim().length > 0;
      }

      return false;
    })();

    const toolbarSaveDisabled =
      !editingField || isSaving || !isCurrentValueValid || !hasPendingChanges;

    return (
      <div className="space-y-6">
        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setSelectedDocument(null)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Button>
          <Button
            onClick={() => setViewMode(viewMode === 'analytics' ? 'raw' : 'analytics')}
            variant="outline"
            className="gap-2"
            style={{ borderColor: '#0077B6', color: '#0077B6' }}
          >
            <FileSearch className="w-4 h-4" />
            {viewMode === 'analytics' ? 'View Document' : 'View Analytics'}
          </Button>
          {viewMode === 'analytics' && (
            <Button
              onClick={() => setIsHistoryModalOpen(true)}
              variant="outline"
              className="gap-2"
              style={{ borderColor: '#0077B6', color: '#0077B6' }}
            >
              <History className="w-4 h-4" />
              Change History
            </Button>
          )}
          {viewMode === 'analytics' && (
            <Button
              onClick={() => exportDocument({
                id: selectedDocument.id,
                input_text: selectedDocument.input_text,
                insights: {
                  themes: selectedDocument.insights.themesIdentified || [],
                  sentiment: {
                    overall: selectedDocument.insights.sentimentAnalysis?.overall_sentiment || 'neutral',
                    confidence: selectedDocument.insights.sentimentAnalysis?.confidence || 0.95,
                  },
                  contentAnalysis: {
                    wordCount: selectedDocument.insights.contentAnalysis?.word_count || 0,
                    characterCount: selectedDocument.insights.contentAnalysis?.character_count || 0,
                    paragraphCount: selectedDocument.insights.contentAnalysis?.paragraph_count || 0,
                  },
                  keyPoints: selectedDocument.insights.proposedActions || [],
                  actionItems: selectedDocument.insights.proposedActions || [],
                  participants: selectedDocument.insights.keyActors || [],
                  challenges: selectedDocument.insights.challenges || [],
                  opportunities: selectedDocument.insights.opportunities || [],
                  pillarAnalysis: selectedDocument.insights.pillarAnalysis,
                },
                metadata: {
                  processedAt: selectedDocument.created_at || new Date().toISOString(),
                  modelUsed: 'gpt-4o-mini',
                  confidenceScore: 0.95,
                },
              })}
              variant="outline"
              className="gap-2"
              style={{ borderColor: '#2563eb', color: '#2563eb' }}
            >
              <Download className="w-4 h-4" />
              Export Word Document
            </Button>
          )}
        </div>

        {editingField && editingDisplayLabel && (
          <div className="sticky top-20 z-30">
            <Card className="flex flex-wrap items-center justify-between gap-4 border border-slate-200 bg-white/95 px-6 py-4 shadow-md backdrop-blur">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  Editing {editingDisplayLabel}
                </p>
                <p className="text-xs text-slate-500">
                  Save to sync changes with the backend or cancel to discard them.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="h-8 px-3"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  className="h-8 px-4 bg-[#0077B6] text-white hover:bg-[#00629a]"
                  disabled={toolbarSaveDisabled}
                  onClick={() => saveField(editingField as InsightFieldKey)}
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                  ) : (
                    <Check className="w-3 h-3 mr-2" />
                  )}
                  Save changes
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Raw Document View */}
        {viewMode === 'raw' && (
          <Card className="p-10 bg-white border-transparent shadow-lg">
            <div className="w-full max-w-4xl mx-auto">
              <h3 className="mb-6" style={{ color: '#0077B6' }}>Document Content</h3>
              <div className="rounded-2xl bg-white shadow-lg px-5 py-6">
                <div
                  className="font-sans text-base leading-7 text-slate-900 px-6 py-8"
                  style={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    fontFeatureSettings: '"liga" on, "clig" on',
                  }}
                >
                  {selectedDocument.insights.rawText}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <>
            {/* Document Header */}
            <Card className="p-6 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Document Title</span>
                  {editingField !== 'title' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing('title', selectedDocument.title)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      style={{ color: '#0077B6' }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'title' ? (
                  <div className="space-y-2">
                    <Input
                      value={(editValues.title as string) || ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full border-blue-300 focus:border-blue-500"
                      placeholder="Enter document title..."
                    />
                    <p className="text-xs text-slate-500">
                      Use the save bar above to confirm or cancel your edits.
                    </p>
                  </div>
                ) : (
                  <h2 style={{ color: '#0077B6' }} className="cursor-pointer hover:bg-blue-50/30 p-1 rounded transition-colors" onClick={() => startEditing('title', selectedDocument.title)}>
                    {selectedDocument.title}
                  </h2>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedDocument.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedDocument.uploader}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${getSentimentColor(selectedDocument.sentiment)} capitalize gap-2`}
            >
              {getSentimentIcon(selectedDocument.sentiment)}
              {selectedDocument.sentiment}
            </Badge>
          </div>
        </Card>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Theme */}
          <Card className="p-5 bg-gradient-to-br from-[#89CFF0]/20 to-[#0077B6]/10 border-2 border-[#0077B6]/30 group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#0077B6] rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Main Theme</p>
                  {editingField !== 'mainTheme' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing('mainTheme', selectedDocument.insights.mainTheme)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      style={{ color: '#0077B6' }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'mainTheme' ? (
                  <div className="space-y-2">
                    <Input
                      value={(editValues.mainTheme as string) || ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, mainTheme: e.target.value }))}
                      className="w-full border-blue-300 focus:border-blue-500"
                      placeholder="Enter main theme..."
                    />
                    <p className="text-xs text-slate-500">
                      Use the save bar above to confirm or cancel your edits.
                    </p>
                  </div>
                ) : (
                  <h4 className="cursor-pointer hover:bg-[#0077B6]/10 p-1 rounded transition-colors" onClick={() => startEditing('mainTheme', selectedDocument.insights.mainTheme)}>
                    {selectedDocument.insights.mainTheme}
                  </h4>
                )}
              </div>
            </div>
          </Card>

          {/* Subthemes */}
          <Card className="p-5 bg-gradient-to-br from-[#C3B1E1]/20 to-[#C3B1E1]/10 border-2 border-[#C3B1E1]/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C3B1E1] rounded-lg">
                <BarChart3 className="w-5 h-5 text-[#2C3E50]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Subthemes</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.insights.subthemes.map((theme, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-[#C3B1E1]/30">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Key Actors */}
          <Card className="p-5 bg-gradient-to-br from-[#A8E6CF]/20 to-[#A8E6CF]/10 border-2 border-[#A8E6CF]/50 group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#A8E6CF] rounded-lg">
                <Users className="w-5 h-5 text-[#2C3E50]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Key Actors</p>
                  {editingField !== 'keyActors' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing('keyActors', selectedDocument.insights.keyActors)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      style={{ color: '#2C3E50' }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'keyActors' ? (
                  <div className="space-y-3">
                    {/* Current items for editing */}
                    <div className="space-y-2">
                      {(editValues.keyActors as string[] || []).map((actor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={actor}
                            onChange={(e) => {
                              const newActors = [...(editValues.keyActors as string[] || [])];
                              newActors[index] = e.target.value;
                              setEditValues(prev => ({ ...prev, keyActors: newActors }));
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newActors = (editValues.keyActors as string[] || []).filter((_, i) => i !== index);
                              setEditValues(prev => ({ ...prev, keyActors: newActors }));
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {/* Add new item */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add key actor..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const newValue = e.currentTarget.value.trim();
                            const currentActors = (editValues.keyActors as string[] || []);
                            if (!currentActors.includes(newValue)) {
                              setEditValues(prev => ({ ...prev, keyActors: [...currentActors, newValue] }));
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Use the save bar above to confirm or cancel your edits.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 cursor-pointer hover:bg-[#A8E6CF]/10 p-1 rounded transition-colors" onClick={() => startEditing('keyActors', selectedDocument.insights.keyActors)}>
                    {selectedDocument.insights.keyActors.map((actor, idx) => (
                      <Badge key={idx} variant="outline" className="border-[#A8E6CF] bg-white">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* General Perception */}
          <Card className="p-5 bg-gradient-to-br from-[#FFD3B6]/20 to-[#FFD3B6]/10 border-2 border-[#FFD3B6]/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FFD3B6] rounded-lg">
                {selectedDocument.insights.generalPerception === 'positive' && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                {selectedDocument.insights.generalPerception === 'neutral' && (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                {selectedDocument.insights.generalPerception === 'negative' && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">General Perception</p>
                <Badge
                  variant="secondary"
                  className={`capitalize ${
                    selectedDocument.insights.generalPerception === 'positive'
                      ? 'bg-green-100 text-green-700'
                      : selectedDocument.insights.generalPerception === 'neutral'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedDocument.insights.generalPerception}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Proposed Actions */}
          <Card className="p-5 bg-gradient-to-br from-[#89CFF0]/20 to-white border-2 border-[#89CFF0]/50 lg:col-span-2 group">
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: '#0077B6' }}>Proposed Actions</p>
              {editingField !== 'proposedActions' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing('proposedActions', selectedDocument.insights.proposedActions)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  style={{ color: '#0077B6' }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
            {editingField === 'proposedActions' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {(editValues.proposedActions as string[] || []).map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={action}
                        onChange={(e) => {
                          const newActions = [...(editValues.proposedActions as string[] || [])];
                          newActions[index] = e.target.value;
                          setEditValues(prev => ({ ...prev, proposedActions: newActions }));
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newActions = (editValues.proposedActions as string[] || []).filter((_, i) => i !== index);
                          setEditValues(prev => ({ ...prev, proposedActions: newActions }));
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add proposed action..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newValue = e.currentTarget.value.trim();
                        const currentActions = (editValues.proposedActions as string[] || []);
                        if (!currentActions.includes(newValue)) {
                          setEditValues(prev => ({ ...prev, proposedActions: [...currentActions, newValue] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Use the save bar above to confirm or cancel your edits.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 cursor-pointer hover:bg-[#89CFF0]/10 p-2 rounded transition-colors" onClick={() => startEditing('proposedActions', selectedDocument.insights.proposedActions)}>
                {selectedDocument.insights.proposedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#0077B6' }} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Challenges */}
          <Card className="p-5 bg-gradient-to-br from-[#FF6B6B]/10 to-white border-2 border-[#FF6B6B]/30 group">
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: '#FF6B6B' }}>Challenges</p>
              {editingField !== 'challenges' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing('challenges', selectedDocument.insights.challenges)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  style={{ color: '#FF6B6B' }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
            {editingField === 'challenges' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {(editValues.challenges as string[] || []).map((challenge, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={challenge}
                        onChange={(e) => {
                          const newChallenges = [...(editValues.challenges as string[] || [])];
                          newChallenges[index] = e.target.value;
                          setEditValues(prev => ({ ...prev, challenges: newChallenges }));
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newChallenges = (editValues.challenges as string[] || []).filter((_, i) => i !== index);
                          setEditValues(prev => ({ ...prev, challenges: newChallenges }));
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add challenge..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newValue = e.currentTarget.value.trim();
                        const currentChallenges = (editValues.challenges as string[] || []);
                        if (!currentChallenges.includes(newValue)) {
                          setEditValues(prev => ({ ...prev, challenges: [...currentChallenges, newValue] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Use the save bar above to confirm or cancel your edits.
                </p>
              </div>
            ) : (
              <ul className="space-y-2 cursor-pointer hover:bg-[#FF6B6B]/10 p-2 rounded transition-colors" onClick={() => startEditing('challenges', selectedDocument.insights.challenges)}>
                {selectedDocument.insights.challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FF6B6B' }} />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Opportunities */}
          <Card className="p-5 bg-gradient-to-br from-[#A8E6CF]/20 to-white border-2 border-[#A8E6CF]/50 group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-green-700">Opportunities</p>
              {editingField !== 'opportunities' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing('opportunities', selectedDocument.insights.opportunities)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  style={{ color: '#15803d' }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
            {editingField === 'opportunities' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {(editValues.opportunities as string[] || []).map((opportunity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={opportunity}
                        onChange={(e) => {
                          const newOpportunities = [...(editValues.opportunities as string[] || [])];
                          newOpportunities[index] = e.target.value;
                          setEditValues(prev => ({ ...prev, opportunities: newOpportunities }));
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOpportunities = (editValues.opportunities as string[] || []).filter((_, i) => i !== index);
                          setEditValues(prev => ({ ...prev, opportunities: newOpportunities }));
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add opportunity..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newValue = e.currentTarget.value.trim();
                        const currentOpportunities = (editValues.opportunities as string[] || []);
                        if (!currentOpportunities.includes(newValue)) {
                          setEditValues(prev => ({ ...prev, opportunities: [...currentOpportunities, newValue] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Use the save bar above to confirm or cancel your edits.
                </p>
              </div>
            ) : (
              <ul className="space-y-2 cursor-pointer hover:bg-[#A8E6CF]/10 p-2 rounded transition-colors" onClick={() => startEditing('opportunities', selectedDocument.insights.opportunities)}>
                {selectedDocument.insights.opportunities.map((opportunity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Meeting Date */}
          <Card className="p-5 bg-gradient-to-br from-[#89CFF0]/20 to-[#0077B6]/10 border-2 border-[#0077B6]/30 group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#0077B6] rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Día de la reunión</p>
                  {editingField !== 'meetingDate' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing('meetingDate', selectedDocument.insights.meetingDate ?? selectedDocument.meetingDate)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      style={{ color: '#0077B6' }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'meetingDate' ? (
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={(editValues.meetingDate as string) || ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, meetingDate: e.target.value }))}
                      className="w-full border-blue-300 focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500">
                      Use the save bar above to confirm or cancel your edits.
                    </p>
                  </div>
                ) : (
                  <div className="cursor-pointer hover:bg-[#0077B6]/10 p-1 rounded transition-colors" onClick={() => startEditing('meetingDate', selectedDocument.insights.meetingDate ?? selectedDocument.meetingDate)}>
                    {(selectedDocument.insights.meetingDate ?? selectedDocument.meetingDate) ? (
                      <span className="font-medium">
                        {new Date(selectedDocument.insights.meetingDate ?? selectedDocument.meetingDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">No date set</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Attending Shapers */}
          <Card className="p-5 bg-gradient-to-br from-[#FFD580]/20 to-[#FF8C42]/10 border-2 border-[#FF8C42]/30 group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FF8C42] rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Shapers asistentes</p>
                  {editingField !== 'attendingShapers' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing('attendingShapers', selectedDocument.insights.attendingShapers ?? selectedDocument.attendingShapers)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      style={{ color: '#FF8C42' }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'attendingShapers' ? (
                  <div className="space-y-2">
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {AVAILABLE_SHAPERS.map((shaper) => (
                        <label key={shaper} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#FF8C42]/5 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={(editValues.attendingShapers as string[] || []).includes(shaper)}
                            onChange={(e) => {
                              const currentShapers = (editValues.attendingShapers as string[] || []);
                              if (e.target.checked) {
                                setEditValues(prev => ({ ...prev, attendingShapers: [...currentShapers, shaper] }));
                              } else {
                                setEditValues(prev => ({ ...prev, attendingShapers: currentShapers.filter(s => s !== shaper) }));
                              }
                            }}
                            className="rounded border-orange-300 text-[#FF8C42] focus:ring-[#FF8C42]"
                          />
                          <span>{shaper}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Use the save bar above to confirm or cancel your edits.
                    </p>
                  </div>
                ) : (
                  <div className="cursor-pointer hover:bg-[#FF8C42]/10 p-1 rounded transition-colors" onClick={() => startEditing('attendingShapers', selectedDocument.insights.attendingShapers ?? selectedDocument.attendingShapers)}>
                    {(selectedDocument.insights.attendingShapers ?? selectedDocument.attendingShapers) && (selectedDocument.insights.attendingShapers ?? selectedDocument.attendingShapers).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {(selectedDocument.insights.attendingShapers ?? selectedDocument.attendingShapers).map((shaper, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-[#FF8C42]/30 text-[#8B4513]">
                            {shaper}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No shapers selected</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Google Docs Link */}
          <Card className="p-5 bg-gradient-to-br from-[#B8E6B8]/20 to-[#4CAF50]/10 border-2 border-[#4CAF50]/30 group lg:col-span-2 xl:col-span-1">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#4CAF50] rounded-lg">
                <Link className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Enlace a Google Docs</p>
                  {editingField !== 'googleDocsLink' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing('googleDocsLink', selectedDocument.insights.googleDocsLink ?? selectedDocument.googleDocsLink)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      style={{ color: '#4CAF50' }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'googleDocsLink' ? (
                  <div className="space-y-2">
                    <Input
                      type="url"
                      value={(editValues.googleDocsLink as string) || ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, googleDocsLink: e.target.value }))}
                      className="w-full border-green-300 focus:border-green-500"
                      placeholder="https://docs.google.com/..."
                    />
                    <p className="text-xs text-slate-500">
                      Use the save bar above to confirm or cancel your edits.
                    </p>
                  </div>
                ) : (
                  <div className="cursor-pointer hover:bg-[#4CAF50]/10 p-1 rounded transition-colors" onClick={() => startEditing('googleDocsLink', selectedDocument.insights.googleDocsLink ?? selectedDocument.googleDocsLink)}>
                    {(selectedDocument.insights.googleDocsLink ?? selectedDocument.googleDocsLink) ? (
                      <a
                        href={selectedDocument.insights.googleDocsLink ?? selectedDocument.googleDocsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4CAF50] hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(() => {
                          try {
                            const url = new URL(selectedDocument.insights.googleDocsLink ?? selectedDocument.googleDocsLink);
                            return url.hostname + url.pathname;
                          } catch {
                            return selectedDocument.insights.googleDocsLink ?? selectedDocument.googleDocsLink;
                          }
                        })()}
                      </a>
                    ) : (
                      <span className="text-gray-500 italic">No link set</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* YSI Pillar Analysis */}
        {selectedDocument.insights.pillarAnalysis && Object.keys(selectedDocument.insights.pillarAnalysis).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: '#0077B6' }} />
              <h3 style={{ color: '#0077B6' }}>YSI Pillar Analysis</h3>
              <Badge variant="secondary" className="bg-[#0077B6]/10 text-[#0077B6]">
                Enhanced Insights
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Access to Capital */}
              {selectedDocument.insights.pillarAnalysis.access_to_capital && (
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-800">🔹 Access to Capital</h4>
                  </div>

                  {selectedDocument.insights.pillarAnalysis.access_to_capital.problems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-700 mb-2">Problems:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.access_to_capital.problems.map((problem, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-3 h-3 mt-1 shrink-0 text-red-500" />
                            <InsightWithEvidence insight={problem} type="problem" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDocument.insights.pillarAnalysis.access_to_capital.proposals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Proposals:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.access_to_capital.proposals.map((proposal, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 mt-1 shrink-0 text-green-500" />
                            <InsightWithEvidence insight={proposal} type="proposal" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Ecosystem Support */}
              {selectedDocument.insights.pillarAnalysis.ecosystem_support && (
                <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Network className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-800">🔹 Ecosystem Support</h4>
                  </div>

                  {selectedDocument.insights.pillarAnalysis.ecosystem_support.problems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-700 mb-2">Problems:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.ecosystem_support.problems.map((problem, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-3 h-3 mt-1 shrink-0 text-red-500" />
                            <InsightWithEvidence insight={problem} type="problem" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDocument.insights.pillarAnalysis.ecosystem_support.proposals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Proposals:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.ecosystem_support.proposals.map((proposal, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 mt-1 shrink-0 text-green-500" />
                            <InsightWithEvidence insight={proposal} type="proposal" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Mental Health */}
              {selectedDocument.insights.pillarAnalysis.mental_health && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-purple-800">🔹 Mental Health</h4>
                  </div>

                  {selectedDocument.insights.pillarAnalysis.mental_health.problems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-700 mb-2">Problems:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.mental_health.problems.map((problem, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-3 h-3 mt-1 shrink-0 text-red-500" />
                            <InsightWithEvidence insight={problem} type="problem" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDocument.insights.pillarAnalysis.mental_health.proposals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Proposals:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.mental_health.proposals.map((proposal, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 mt-1 shrink-0 text-green-500" />
                            <InsightWithEvidence insight={proposal} type="proposal" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Recognition */}
              {selectedDocument.insights.pillarAnalysis.recognition && (
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-orange-800">🔹 Recognition</h4>
                  </div>

                  {selectedDocument.insights.pillarAnalysis.recognition.problems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-700 mb-2">Problems:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.recognition.problems.map((problem, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-3 h-3 mt-1 shrink-0 text-red-500" />
                            <InsightWithEvidence insight={problem} type="problem" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDocument.insights.pillarAnalysis.recognition.proposals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Proposals:</p>
                      <ul className="space-y-1">
                        {selectedDocument.insights.pillarAnalysis.recognition.proposals.map((proposal, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 mt-1 shrink-0 text-green-500" />
                            <InsightWithEvidence insight={proposal} type="proposal" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Network Visualization */}
        <Card className="p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5" style={{ color: '#0077B6' }} />
            <h3 style={{ color: '#0077B6' }}>Stakeholder & Topic Network</h3>
          </div>

          {selectedDocument.insights.networkAnalysis ? (
            <div className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-[#E8F1F9] to-white rounded-lg border-2 border-[#0077B6]/20 flex items-center justify-center relative overflow-hidden">
                <NetworkGraph networkData={selectedDocument.insights.networkAnalysis} />
              </div>

              {/* Network Metrics */}
              <div className="flex flex-wrap justify-center items-center gap-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-600">Stakeholders:</span>
                  <span className="text-xl font-bold" style={{ color: '#0077B6' }}>
                    {selectedDocument.insights.networkAnalysis.stakeholders.length}
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">Relationships:</span>
                  <span className="text-xl font-bold text-green-600">
                    {selectedDocument.insights.networkAnalysis.relationships.length}
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-purple-600">Network Density:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {selectedDocument.insights.networkAnalysis.network_density}
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-600">Topics:</span>
                  <span className="text-xl font-bold text-amber-600">
                    {selectedDocument.insights.networkAnalysis.topic_networks?.length || 0}
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-600">Geo Clusters:</span>
                  <span className="text-xl font-bold text-cyan-600">
                    {selectedDocument.insights.networkAnalysis.geographic_clusters?.length || 0}
                  </span>
                </div>
              </div>

              {/* Primary Connectors Info */}
              {selectedDocument.insights.networkAnalysis.primary_connectors &&
                selectedDocument.insights.networkAnalysis.primary_connectors.length > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">★</span>
                      <h4 className="text-sm font-semibold text-yellow-800">
                        Primary Connectors
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.insights.networkAnalysis.primary_connectors.map(
                        (connector, idx) => (
                          <Badge
                            key={idx}
                            className="bg-yellow-100 text-yellow-800 border-yellow-300"
                          >
                            {connector}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Legend */}
              <NetworkLegend />
            </div>
          ) : (
            /* Fallback to simple visualization if no network analysis */
            <div className="aspect-video bg-gradient-to-br from-[#E8F1F9] to-white rounded-lg border-2 border-[#0077B6]/20 flex items-center justify-center relative overflow-hidden">
              {/* Simple network visualization */}
              <svg className="w-full h-full" viewBox="0 0 800 400">
                {/* Central node */}
                <circle cx="400" cy="200" r="40" fill="#0077B6" />
                <text x="400" y="205" textAnchor="middle" fill="white" fontSize="12">
                  Main Theme
                </text>

                {/* Connected nodes */}
                {selectedDocument.insights.keyActors.slice(0, 3).map((actor, idx) => {
                  const angle = (idx * 120 * Math.PI) / 180;
                  const x = 400 + Math.cos(angle) * 150;
                  const y = 200 + Math.sin(angle) * 100;

                  return (
                    <g key={idx}>
                      <line
                        x1="400"
                        y1="200"
                        x2={x}
                        y2={y}
                        stroke="#0077B6"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        opacity="0.3"
                      />
                      <circle cx={x} cy={y} r="30" fill="#A8E6CF" />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fill="#2C3E50"
                        fontSize="10"
                        className="max-w-[60px]"
                      >
                        {actor.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Subtheme nodes */}
                {selectedDocument.insights.subthemes.slice(0, 3).map((theme, idx) => {
                  const angle = ((idx * 120 + 60) * Math.PI) / 180;
                  const x = 400 + Math.cos(angle) * 180;
                  const y = 200 + Math.sin(angle) * 120;

                  return (
                    <g key={idx}>
                      <line
                        x1="400"
                        y1="200"
                        x2={x}
                        y2={y}
                        stroke="#C3B1E1"
                        strokeWidth="2"
                        opacity="0.2"
                      />
                      <circle cx={x} cy={y} r="25" fill="#C3B1E1" opacity="0.8" />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </Card>

        {/* Change History Modal */}
        <ChangeHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          documentId={selectedDocument.id}
          documentType={documentType}
          documentTitle={selectedDocument.title}
        />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 style={{ color: '#0077B6' }}>Processed Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-white border-[#E0E0E0]"
        />
      </div>

      <div className="space-y-3">
        {filteredDocuments.map((doc) => (
          <Card
            key={doc.id}
            className="p-5 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#0077B6] border-2"
            onClick={() => {
              setSelectedDocument(doc);
              setDocumentType(doc.documentType ?? 'text_processing_job');
              setViewMode('analytics');
            }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-[#E8F1F9] to-[#89CFF0]/30 rounded-lg">
                <FileText className="w-6 h-6" style={{ color: '#0077B6' }} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="mb-2">{doc.title}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {new Date(doc.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="truncate">{doc.uploader}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#0077B6' }} />
                    <span className="truncate text-muted-foreground">{doc.mainTheme}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getSentimentIcon(doc.sentiment)}
                    <span className="capitalize text-muted-foreground">{doc.sentiment}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card className="p-12 bg-white text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#0077B6' }} />
          <p className="text-muted-foreground">
            {searchQuery ? 'No documents match your search' : 'No documents found'}
          </p>
        </Card>
      )}
    </div>
  );
}

// Helper function to get stakeholder type color
const getStakeholderTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    funder: '#22C55E', // Green
    mentor: '#3B82F6', // Blue
    implementer: '#8B5CF6', // Purple
    beneficiary: '#F59E0B', // Amber
    policymaker: '#EF4444', // Red
    organization: '#06B6D4', // Cyan
    researcher: '#84CC16', // Lime
    community_leader: '#F97316' // Orange
  };
  return colors[type] || '#6B7280'; // Default gray
};

// Helper function to get relationship style
const getRelationshipStyle = (strength: string): { strokeWidth: number; strokeDasharray?: string; opacity: number } => {
  switch (strength) {
    case 'strong':
      return { strokeWidth: 3, opacity: 0.8 };
    case 'moderate':
      return { strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.6 };
    case 'weak':
      return { strokeWidth: 1, strokeDasharray: '2,3', opacity: 0.4 };
    default:
      return { strokeWidth: 1, opacity: 0.4 };
  }
};

// NetworkGraph Component
interface NetworkGraphProps {
  networkData: NetworkAnalysis;
}

// Helper function to get relationship color by type
const getRelationshipColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    collaboration: '#0077B6', // Blue
    funding: '#22C55E', // Green
    support: '#F97316', // Orange
    partnership: '#8B5CF6', // Purple
    mentorship: '#3B82F6', // Light Blue
  };
  return colors[type] || '#6B7280'; // Default gray
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ networkData }) => {
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);
  const [hoveredRelationship, setHoveredRelationship] = useState<number | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  // Find the hub node (most connected stakeholder)
  const connectionCounts = networkData.stakeholders.map(s => ({
    name: s.name,
    count: networkData.relationships.filter(
      r => r.from_stakeholder === s.name || r.to_stakeholder === s.name
    ).length
  }));

  const hubNode = connectionCounts.sort((a, b) => b.count - a.count)[0]?.name;
  const isPrimaryConnector = (name: string) =>
    networkData.primary_connectors?.includes(name) || false;

  // Layout configuration
  const viewBoxWidth = 1000;
  const viewBoxHeight = 600;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;
  const radius = 180;
  const topicRadius = 280;

  // Calculate positions: hub in center, others around
  const stakeholderPositions = networkData.stakeholders.reduce((acc, stakeholder, index) => {
    if (stakeholder.name === hubNode) {
      // Place hub node in center
      acc[stakeholder.name] = { x: centerX, y: centerY };
    } else {
      // Place other nodes in circle around hub
      const otherNodes = networkData.stakeholders.filter(s => s.name !== hubNode);
      const nodeIndex = otherNodes.findIndex(s => s.name === stakeholder.name);
      const angle = (nodeIndex * 2 * Math.PI) / otherNodes.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      acc[stakeholder.name] = { x, y };
    }
    return acc;
  }, {} as { [name: string]: { x: number; y: number } });

  // Calculate topic positions (outer ring)
  const topicPositions = networkData.topic_networks?.reduce((acc, topic, index) => {
    const angle = (index * 2 * Math.PI) / (networkData.topic_networks?.length || 1) - Math.PI / 2;
    const x = centerX + Math.cos(angle) * topicRadius;
    const y = centerY + Math.sin(angle) * topicRadius;
    acc[topic.topic] = { x, y };
    return acc;
  }, {} as { [name: string]: { x: number; y: number } }) || {};

  // Helper to get topic color based on pillar alignment
  const getTopicColor = (alignment: string): string => {
    const colors: { [key: string]: string } = {
      access_to_capital: '#3B82F6', // Blue
      ecosystem_support: '#10B981', // Green
      mental_health: '#A855F7', // Purple
      recognition: '#F59E0B', // Amber
    };
    return colors[alignment] || '#6B7280';
  };

  // Helper to calculate tooltip position intelligently
  const getTooltipPosition = (x: number, y: number, nodeSize: number) => {
    const tooltipWidth = 240;
    const tooltipHeight = 140;
    const margin = 10;

    let tooltipX = x + nodeSize + margin;
    let tooltipY = y - tooltipHeight / 2;

    // Check right boundary
    if (tooltipX + tooltipWidth > viewBoxWidth - margin) {
      tooltipX = x - tooltipWidth - nodeSize - margin;
    }

    // Check top boundary
    if (tooltipY < margin) {
      tooltipY = margin;
    }

    // Check bottom boundary
    if (tooltipY + tooltipHeight > viewBoxHeight - margin) {
      tooltipY = viewBoxHeight - tooltipHeight - margin;
    }

    return { x: tooltipX, y: tooltipY };
  };

  return (
    <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
      {/* Render geographic clusters as background regions */}
      {networkData.geographic_clusters?.map((cluster, index) => {
        // Find all positions for stakeholders in this cluster
        const clusterStakeholderPositions = cluster.stakeholders
          .map(name => stakeholderPositions[name])
          .filter(pos => pos !== undefined);

        if (clusterStakeholderPositions.length === 0) return null;

        // Calculate bounding box
        const xs = clusterStakeholderPositions.map(p => p.x);
        const ys = clusterStakeholderPositions.map(p => p.y);
        const minX = Math.min(...xs) - 60;
        const maxX = Math.max(...xs) + 60;
        const minY = Math.min(...ys) - 60;
        const maxY = Math.max(...ys) + 60;

        const regionColors = ['rgba(59, 130, 246, 0.08)', 'rgba(16, 185, 129, 0.08)', 'rgba(245, 158, 11, 0.08)'];
        const borderColors = ['rgba(59, 130, 246, 0.3)', 'rgba(16, 185, 129, 0.3)', 'rgba(245, 158, 11, 0.3)'];

        return (
          <g key={`cluster-${index}`}>
            <rect
              x={minX}
              y={minY}
              width={maxX - minX}
              height={maxY - minY}
              fill={regionColors[index % regionColors.length]}
              stroke={borderColors[index % borderColors.length]}
              strokeWidth="2"
              strokeDasharray="5,5"
              rx="15"
            />
            <text
              x={minX + 10}
              y={minY + 20}
              fill="#333"
              fontSize="11"
              fontWeight="600"
            >
              📍 {cluster.region}
            </text>
          </g>
        );
      })}

      {/* Render topic connections */}
      {networkData.topic_networks?.map((topic, topicIndex) => {
        const topicPos = topicPositions[topic.topic];
        if (!topicPos) return null;

        return topic.connected_stakeholders.map((stakeholderName, idx) => {
          const stakeholderPos = stakeholderPositions[stakeholderName];
          if (!stakeholderPos) return null;

          return (
            <line
              key={`topic-line-${topicIndex}-${idx}`}
              x1={topicPos.x}
              y1={topicPos.y}
              x2={stakeholderPos.x}
              y2={stakeholderPos.y}
              stroke={getTopicColor(topic.pillar_alignment)}
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.3"
            />
          );
        });
      })}

      {/* Render relationships */}
      {networkData.relationships.map((relationship, index) => {
        const fromPos = stakeholderPositions[relationship.from_stakeholder];
        const toPos = stakeholderPositions[relationship.to_stakeholder];

        if (!fromPos || !toPos) return null;

        const style = getRelationshipStyle(relationship.strength);
        const color = getRelationshipColor(relationship.type);
        const isHovered = hoveredRelationship === index;

        // Calculate midpoint for label
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;

        // Calculate angle for label rotation
        const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) * (180 / Math.PI);

        return (
          <g
            key={index}
            onMouseEnter={() => setHoveredRelationship(index)}
            onMouseLeave={() => setHoveredRelationship(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Relationship line */}
            <line
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={color}
              strokeWidth={isHovered ? style.strokeWidth + 1 : style.strokeWidth}
              strokeDasharray={style.strokeDasharray}
              opacity={isHovered ? 1 : style.opacity}
              markerEnd="url(#arrowhead)"
            />

            {/* Relationship label (shown on hover) */}
            {isHovered && (
              <g>
                <rect
                  x={midX - 40}
                  y={midY - 25}
                  width="80"
                  height="35"
                  fill="rgba(0,0,0,0.85)"
                  rx="4"
                />
                <text
                  x={midX}
                  y={midY - 12}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {relationship.type}
                </text>
                <text
                  x={midX}
                  y={midY - 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                >
                  {relationship.strength}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Define arrowhead marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#0077B6" opacity="0.6" />
        </marker>
      </defs>

      {/* Render stakeholders */}
      {networkData.stakeholders.map((stakeholder, index) => {
        const position = stakeholderPositions[stakeholder.name];
        if (!position) return null;

        const isHub = stakeholder.name === hubNode;
        const baseSize = isHub ? 35 : 25;
        const nodeSize = Math.max(baseSize, Math.min(50, baseSize + stakeholder.mentioned_frequency * 3));
        const color = getStakeholderTypeColor(stakeholder.type);
        const isHovered = hoveredStakeholder === stakeholder.name;

        // Truncate name for display
        const displayName = stakeholder.name.length > 15
          ? stakeholder.name.substring(0, 15) + '...'
          : stakeholder.name;

        return (
          <g
            key={index}
            onMouseEnter={() => setHoveredStakeholder(stakeholder.name)}
            onMouseLeave={() => setHoveredStakeholder(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Node circle */}
            <circle
              cx={position.x}
              cy={position.y}
              r={nodeSize}
              fill={color}
              stroke={isHovered ? '#333' : 'white'}
              strokeWidth={isHovered ? 3 : 2}
              opacity={isHovered ? 1 : 0.9}
            />

            {/* Node label inside circle for hub, outside for others */}
            {isHub ? (
              <text
                x={position.x}
                y={position.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {stakeholder.name.split(' ').slice(0, 2).join(' ')}
              </text>
            ) : (
              <>
                <text
                  x={position.x}
                  y={position.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {stakeholder.name.split(' ')[0].substring(0, 8)}
                </text>
                <text
                  x={position.x}
                  y={position.y + nodeSize + 15}
                  textAnchor="middle"
                  fill="#333"
                  fontSize="10"
                  fontWeight="500"
                >
                  {displayName}
                </text>
              </>
            )}

            {/* Primary Connector Badge */}
            {isPrimaryConnector(stakeholder.name) && (
              <g>
                <circle
                  cx={position.x + nodeSize - 8}
                  cy={position.y - nodeSize + 8}
                  r="10"
                  fill="#FFD700"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={position.x + nodeSize - 8}
                  y={position.y - nodeSize + 12}
                  textAnchor="middle"
                  fill="#000"
                  fontSize="12"
                  fontWeight="bold"
                >
                  ★
                </text>
              </g>
            )}

            {/* Enhanced tooltip on hover */}
            {isHovered && (
              <g>
                {(() => {
                  const tooltipPos = getTooltipPosition(position.x, position.y, nodeSize);
                  const tooltipWidth = 240;
                  const lineHeight = 14;
                  let currentY = tooltipPos.y + 20;

                  // Word wrap for context
                  const wrapText = (text: string, maxWidth: number) => {
                    const words = text.split(' ');
                    const lines: string[] = [];
                    let currentLine = '';

                    words.forEach(word => {
                      const testLine = currentLine ? `${currentLine} ${word}` : word;
                      if (testLine.length * 5.5 < maxWidth) {
                        currentLine = testLine;
                      } else {
                        if (currentLine) lines.push(currentLine);
                        currentLine = word;
                      }
                    });
                    if (currentLine) lines.push(currentLine);
                    return lines;
                  };

                  const contextLines = stakeholder.context
                    ? wrapText(stakeholder.context, tooltipWidth - 20)
                    : [];
                  const tooltipHeight = 80 + contextLines.length * lineHeight;

                  return (
                    <>
                      <rect
                        x={tooltipPos.x}
                        y={tooltipPos.y}
                        width={tooltipWidth}
                        height={tooltipHeight}
                        fill="rgba(0,0,0,0.95)"
                        rx="8"
                        stroke="#0077B6"
                        strokeWidth="2"
                      />
                      <text
                        x={tooltipPos.x + 12}
                        y={currentY}
                        fill="white"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        {stakeholder.name}
                      </text>
                      <text
                        x={tooltipPos.x + 12}
                        y={(currentY += lineHeight + 5)}
                        fill="#A8E6CF"
                        fontSize="11"
                      >
                        Type: {stakeholder.type}
                      </text>
                      {stakeholder.location && (
                        <text
                          x={tooltipPos.x + 12}
                          y={(currentY += lineHeight)}
                          fill="#FFD3B6"
                          fontSize="10"
                        >
                          📍 {stakeholder.location}
                        </text>
                      )}
                      <text
                        x={tooltipPos.x + 12}
                        y={(currentY += lineHeight)}
                        fill="#89CFF0"
                        fontSize="10"
                      >
                        Mentions: {stakeholder.mentioned_frequency}
                      </text>
                      {isPrimaryConnector(stakeholder.name) && (
                        <text
                          x={tooltipPos.x + 12}
                          y={(currentY += lineHeight)}
                          fill="#FFD700"
                          fontSize="10"
                        >
                          ★ Primary Connector
                        </text>
                      )}
                      {stakeholder.context && (
                        <>
                          <text
                            x={tooltipPos.x + 12}
                            y={(currentY += lineHeight + 5)}
                            fill="#C3B1E1"
                            fontSize="10"
                            fontWeight="600"
                          >
                            Context:
                          </text>
                          {contextLines.map((line, idx) => (
                            <text
                              key={idx}
                              x={tooltipPos.x + 12}
                              y={(currentY += lineHeight)}
                              fill="#E0E0E0"
                              fontSize="9"
                            >
                              {line}
                            </text>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </g>
            )}
          </g>
        );
      })}

      {/* Render topic nodes (hexagonal) */}
      {networkData.topic_networks?.map((topic, index) => {
        const position = topicPositions[topic.topic];
        if (!position) return null;

        const topicSize = 35;
        const color = getTopicColor(topic.pillar_alignment);
        const isHovered = hoveredTopic === topic.topic;

        // Hexagon path
        const hexagonPath = (x: number, y: number, size: number) => {
          const points = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            points.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
          }
          return `M ${points.join(' L ')} Z`;
        };

        return (
          <g
            key={`topic-${index}`}
            onMouseEnter={() => setHoveredTopic(topic.topic)}
            onMouseLeave={() => setHoveredTopic(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Hexagonal node */}
            <path
              d={hexagonPath(position.x, position.y, topicSize)}
              fill={color}
              stroke={isHovered ? '#333' : 'white'}
              strokeWidth={isHovered ? 3 : 2}
              opacity={isHovered ? 1 : 0.85}
            />

            {/* Topic label */}
            <text
              x={position.x}
              y={position.y + 4}
              textAnchor="middle"
              fill="white"
              fontSize="9"
              fontWeight="bold"
            >
              {topic.topic.split(' ').slice(0, 2).map((word, idx) => (
                <tspan key={idx} x={position.x} dy={idx === 0 ? 0 : 10}>
                  {word.substring(0, 8)}
                </tspan>
              ))}
            </text>

            {/* Topic tooltip on hover */}
            {isHovered && (
              <g>
                {(() => {
                  const tooltipPos = getTooltipPosition(position.x, position.y, topicSize);
                  const tooltipWidth = 200;
                  const lineHeight = 14;
                  let currentY = tooltipPos.y + 20;

                  return (
                    <>
                      <rect
                        x={tooltipPos.x}
                        y={tooltipPos.y}
                        width={tooltipWidth}
                        height={90}
                        fill="rgba(0,0,0,0.95)"
                        rx="8"
                        stroke={color}
                        strokeWidth="2"
                      />
                      <text
                        x={tooltipPos.x + 12}
                        y={currentY}
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {topic.topic}
                      </text>
                      <text
                        x={tooltipPos.x + 12}
                        y={(currentY += lineHeight + 3)}
                        fill="#A8E6CF"
                        fontSize="10"
                      >
                        Pillar: {topic.pillar_alignment.replace(/_/g, ' ')}
                      </text>
                      <text
                        x={tooltipPos.x + 12}
                        y={(currentY += lineHeight)}
                        fill="#89CFF0"
                        fontSize="10"
                      >
                        Centrality: {topic.centrality}
                      </text>
                      <text
                        x={tooltipPos.x + 12}
                        y={(currentY += lineHeight)}
                        fill="#FFD3B6"
                        fontSize="10"
                      >
                        Connected: {topic.connected_stakeholders.length} stakeholders
                      </text>
                    </>
                  );
                })()}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// NetworkLegend Component
const NetworkLegend: React.FC = () => {
  const stakeholderTypes = [
    { type: 'funder', label: 'Funder', color: '#22C55E' },
    { type: 'mentor', label: 'Mentor', color: '#3B82F6' },
    { type: 'implementer', label: 'Implementer', color: '#8B5CF6' },
    { type: 'beneficiary', label: 'Beneficiary', color: '#F59E0B' },
    { type: 'policymaker', label: 'Policymaker', color: '#EF4444' },
    { type: 'organization', label: 'Organization', color: '#06B6D4' },
    { type: 'researcher', label: 'Researcher', color: '#84CC16' },
    { type: 'community_leader', label: 'Community Leader', color: '#F97316' }
  ];

  const relationshipTypes = [
    { type: 'collaboration', label: 'Collaboration', color: '#0077B6' },
    { type: 'funding', label: 'Funding', color: '#22C55E' },
    { type: 'support', label: 'Support', color: '#F97316' },
    { type: 'partnership', label: 'Partnership', color: '#8B5CF6' },
    { type: 'mentorship', label: 'Mentorship', color: '#3B82F6' }
  ];

  const relationshipStrengths = [
    { strength: 'strong', label: 'Strong', width: 3 },
    { strength: 'moderate', label: 'Moderate', width: 2, dash: '5,5' },
    { strength: 'weak', label: 'Weak', width: 1, dash: '2,3' }
  ];

  return (
    <div className="space-y-4">
      {/* Stakeholder Types - Horizontal Row */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold" style={{ color: '#0077B6' }}>
          Stakeholder Types (Circles):
        </h4>
        {stakeholderTypes.map((item, index) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">{item.label}</span>
            {index < stakeholderTypes.length - 1 && (
              <div className="w-px h-3 bg-gray-300 ml-2"></div>
            )}
          </div>
        ))}
      </div>

      {/* Relationship Types - Horizontal Row */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <h4 className="text-sm font-semibold" style={{ color: '#0077B6' }}>
          Relationship Types:
        </h4>
        {relationshipTypes.map((item, index) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <svg width="20" height="4">
              <line
                x1="0"
                y1="2"
                x2="20"
                y2="2"
                stroke={item.color}
                strokeWidth="3"
              />
            </svg>
            <span className="text-xs text-gray-600">{item.label}</span>
            {index < relationshipTypes.length - 1 && (
              <div className="w-px h-3 bg-gray-300 ml-2"></div>
            )}
          </div>
        ))}
      </div>

      {/* Relationship Strengths - Horizontal Row */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-semibold" style={{ color: '#0077B6' }}>
          Relationship Strength:
        </h4>
        {relationshipStrengths.map((item, index) => (
          <div key={item.strength} className="flex items-center gap-1.5">
            <svg width="20" height="4">
              <line
                x1="0"
                y1="2"
                x2="20"
                y2="2"
                stroke="#0077B6"
                strokeWidth={item.width}
                strokeDasharray={item.dash}
              />
            </svg>
            <span className="text-xs text-gray-600">{item.label}</span>
            {index < relationshipStrengths.length - 1 && (
              <div className="w-px h-3 bg-gray-300 ml-2"></div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Legend Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: '#0077B6' }}>
            Network Elements
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <svg width="20" height="20">
                <path
                  d="M 10,2 L 17,6 L 17,14 L 10,18 L 3,14 L 3,6 Z"
                  fill="#3B82F6"
                  opacity="0.85"
                />
              </svg>
              <span className="text-xs text-gray-600">Topics (Hexagons)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20">
                <circle cx="10" cy="10" r="5" fill="#FFD700" />
                <text
                  x="10"
                  y="13"
                  textAnchor="middle"
                  fill="#000"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ★
                </text>
              </svg>
              <span className="text-xs text-gray-600">Primary Connector</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20">
                <rect
                  x="2"
                  y="2"
                  width="16"
                  height="16"
                  fill="rgba(59, 130, 246, 0.08)"
                  stroke="rgba(59, 130, 246, 0.3)"
                  strokeDasharray="2,2"
                  rx="3"
                />
              </svg>
              <span className="text-xs text-gray-600">Geographic Cluster</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: '#0077B6' }}>
            Interaction Tips
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Hover over nodes to see detailed information</p>
            <p>• Hover over lines to see relationship details</p>
            <p>• Hexagons represent discussion topics</p>
            <p>• Dashed areas show geographic clusters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

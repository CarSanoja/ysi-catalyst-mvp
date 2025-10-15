import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { Button } from './button';
import { History, User, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { ChangeLogEntry, ChangeHistoryModalProps } from '../../types';
import { api } from '../../services/api';

export function ChangeHistoryModal({
  isOpen,
  onClose,
  documentId,
  documentType,
  documentTitle,
}: ChangeHistoryModalProps) {
  const [changes, setChanges] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChangeHistory();
    }
  }, [isOpen, documentId, documentType]);

  const fetchChangeHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = documentType === 'text_processing_job'
        ? await api.notes.getJobChangeHistory(documentId)
        : await api.notes.getSessionChangeHistory(documentId);

      if (response.success && response.data) {
        setChanges(response.data.changes || response.data);
      } else {
        setError('Failed to load change history');
      }
    } catch (error) {
      console.error('Failed to fetch change history:', error);
      setError('Failed to load change history');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: string | null, fieldName: string): string => {
    if (!value) return 'Empty';

    try {
      // Try to parse as JSON for array fields
      if (fieldName.includes('keyActors') || fieldName.includes('proposedActions') ||
          fieldName.includes('challenges') || fieldName.includes('opportunities') ||
          fieldName.includes('attendingShapers')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed.join(', ') : 'Empty';
        }
      }
    } catch {
      // Not JSON, return as is
    }

    // Format date values
    if (fieldName.includes('meetingDate') && value) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return value;
      }
    }

    // Format URL values
    if (fieldName.includes('googleDocsLink') && value) {
      try {
        const url = new URL(value);
        return url.hostname + url.pathname;
      } catch {
        return value;
      }
    }

    return value;
  };

  const getFieldLabel = (fieldName: string): string => {
    const labels: { [key: string]: string } = {
      'title': 'Title',
      'mainTheme': 'Main Theme',
      'keyActors': 'Key Actors',
      'proposedActions': 'Proposed Actions',
      'challenges': 'Challenges',
      'opportunities': 'Opportunities',
      'meetingDate': 'Meeting Date',
      'attendingShapers': 'Attending Shapers',
      'googleDocsLink': 'Google Docs Link',
    };
    return labels[fieldName] || fieldName;
  };

  const getChangeTypeColor = (changeType: string): string => {
    switch (changeType) {
      case 'create':
        return 'bg-green-100 text-green-700';
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" style={{ color: '#0077B6' }} />
            Change History: {documentTitle}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0077B6' }} />
            <span className="ml-3 text-gray-600">Loading change history...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={fetchChangeHistory} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            {changes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Yet</h3>
                <p className="text-gray-500 max-w-md">
                  This document hasn't been modified yet. Changes will appear here once you start editing.
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-1">
                {changes.map((change) => (
                  <div
                    key={change.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={getChangeTypeColor(change.change_type)}
                        >
                          {change.change_type}
                        </Badge>
                        <div className="text-sm">
                          <span className="font-medium">
                            {getFieldLabel(change.field_name)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {change.changed_by}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(change.created_at)}
                        </div>
                      </div>
                    </div>

                    {change.change_type === 'update' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">Previous Value:</p>
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                            {formatValue(change.old_value, change.field_name)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">New Value:</p>
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                            {formatValue(change.new_value, change.field_name)}
                          </div>
                        </div>
                      </div>
                    )}

                    {change.change_type === 'create' && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Initial Value:</p>
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          {formatValue(change.new_value, change.field_name)}
                        </div>
                      </div>
                    )}

                    {change.change_reason && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-1">Reason:</p>
                        <p className="text-sm text-gray-600 italic">{change.change_reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
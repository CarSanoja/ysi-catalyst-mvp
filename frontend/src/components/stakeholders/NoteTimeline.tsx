/**
 * NoteTimeline Component
 * Chronological timeline of notes for a stakeholder
 */

import { useState } from 'react';
import { Note } from '../../types/stakeholder';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { User, Calendar, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface NoteTimelineProps {
  notes: Note[];
  currentUserId?: string;
  onNoteUpdated: (note: Note) => void;
  onNoteDeleted: (noteId: string) => void;
}

export function NoteTimeline({
  notes,
  currentUserId = 'current_user',
  onNoteUpdated,
  onNoteDeleted
}: NoteTimelineProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSave = async (note: Note) => {
    if (!editContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const updatedNote: Note = {
      ...note,
      content: editContent.trim(),
      updated_at: new Date().toISOString()
    };

    onNoteUpdated(updatedNote);
    setEditingNoteId(null);
    setEditContent('');
    toast.success('Note updated');
  };

  const handleCancel = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    onNoteDeleted(noteId);
    toast.success('Note deleted');
  };

  const canEdit = (note: Note) => note.created_by === currentUserId;

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No notes yet. Add your first note above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note, index) => (
        <div
          key={note.id}
          className="border-l-2 border-[#0077B6] pl-4 py-2 space-y-2"
        >
          {/* Note Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="font-medium">{note.created_by}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(note.created_at)}</span>
              </div>
              {note.updated_at !== note.created_at && (
                <Badge variant="secondary" className="text-xs py-0 px-1 h-4">
                  Edited
                </Badge>
              )}
            </div>

            {canEdit(note) && editingNoteId !== note.id && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleEdit(note)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Note Content */}
          {editingNoteId === note.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSave(note)}
                  className="h-7 gap-1 text-xs"
                  style={{ backgroundColor: '#0077B6' }}
                >
                  <Save className="w-3 h-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-7 gap-1 text-xs"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 prose prose-sm max-w-none">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          )}

          {/* Separator (except for last item) */}
          {index < notes.length - 1 && (
            <div className="pt-2 border-b border-gray-100" />
          )}
        </div>
      ))}
    </div>
  );
}

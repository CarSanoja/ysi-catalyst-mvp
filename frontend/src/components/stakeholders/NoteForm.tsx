/**
 * NoteForm Component
 * Form to add a new note to a stakeholder
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Note } from '../../types/stakeholder';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NoteFormProps {
  stakeholderId: string;
  onNoteAdded: (note: Note) => void;
}

export function NoteForm({ stakeholderId, onNoteAdded }: NoteFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Note content is required');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newNote: Note = {
      id: `note-${Date.now()}`,
      stakeholder_id: stakeholderId,
      content: content.trim(),
      created_by: 'current_user', // Mock current user
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onNoteAdded(newNote);
    setContent('');
    setIsSubmitting(false);
    toast.success('Note added successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="note-content">
          Add Note <span className="text-xs text-gray-500">(Markdown supported)</span>
        </Label>
        <Textarea
          id="note-content"
          placeholder="Enter your note here... You can use **bold**, _italic_, and other markdown formatting."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="gap-2"
          style={{ backgroundColor: '#0077B6' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Add Note
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

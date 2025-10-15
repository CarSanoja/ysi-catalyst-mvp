/**
 * StakeholderDetail Component
 * Right drawer displaying full stakeholder info and notes timeline
 */

import { useState } from 'react';
import { Stakeholder, Note } from '../../types/stakeholder';
import { stakeholderTypeConfigs } from '../../types/stakeholder';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { NoteTimeline } from './NoteTimeline';
import { NoteForm } from './NoteForm';
import { Mail, Phone, MapPin, Building, Briefcase, Tag, Link as LinkIcon, User, Calendar, Edit, StickyNote } from 'lucide-react';

interface StakeholderDetailProps {
  open: boolean;
  stakeholder: Stakeholder | null;
  notes: Note[];
  onClose: () => void;
  onEdit: (stakeholder: Stakeholder) => void;
  onNoteAdded: (note: Note) => void;
  onNoteUpdated: (note: Note) => void;
  onNoteDeleted: (noteId: string) => void;
}

export function StakeholderDetail({
  open,
  stakeholder,
  notes,
  onClose,
  onEdit,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted
}: StakeholderDetailProps) {
  const [showNoteForm, setShowNoteForm] = useState(false);

  console.log('📋 StakeholderDetail render:', {
    open,
    hasStakeholder: !!stakeholder,
    stakeholderName: stakeholder?.name
  });

  const typeConfig = stakeholder ? stakeholderTypeConfigs[stakeholder.type] : null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleNoteAdded = (note: Note) => {
    onNoteAdded(note);
    setShowNoteForm(false);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        {!stakeholder ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <SheetTitle className="text-xl">{stakeholder.name}</SheetTitle>
              <SheetDescription className="text-sm">
                <span className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: typeConfig?.bgColor,
                      color: typeConfig?.color,
                      border: `1px solid ${typeConfig?.color}40`
                    }}
                  >
                    {typeConfig?.icon} {typeConfig?.label}
                  </Badge>
                  <span>•</span>
                  <span>{stakeholder.organization}</span>
                </span>
              </SheetDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(stakeholder)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">{stakeholder.role}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{stakeholder.organization}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{stakeholder.region}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <a
                  href={`mailto:${stakeholder.email}`}
                  className="text-[#0077B6] hover:underline"
                >
                  {stakeholder.email}
                </a>
              </div>

              {stakeholder.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a
                    href={`tel:${stakeholder.phone}`}
                    className="text-[#0077B6] hover:underline"
                  >
                    {stakeholder.phone}
                  </a>
                </div>
              )}
            </div>

            <Separator />

            {/* Bio */}
            {stakeholder.bio && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">Bio</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{stakeholder.bio}</p>
              </div>
            )}

            {/* Tags */}
            {stakeholder.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <h4 className="font-semibold text-sm text-gray-900">Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stakeholder.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {stakeholder.links.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  <h4 className="font-semibold text-sm text-gray-900">Links</h4>
                </div>
                <div className="space-y-1">
                  {stakeholder.links.map((link, idx) => (
                    <div key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0077B6] hover:underline flex items-center gap-1"
                      >
                        🔗 {link.label}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Audit Info */}
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>Created by {stakeholder.created_by}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Created {formatDate(stakeholder.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Updated {formatDate(stakeholder.updated_at)}</span>
              </div>
            </div>

            <Separator />

            {/* Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-gray-500" />
                  <h4 className="font-semibold text-sm text-gray-900">
                    Notes ({notes.length})
                  </h4>
                </div>
                {!showNoteForm && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNoteForm(true)}
                    className="gap-2"
                  >
                    Add Note
                  </Button>
                )}
              </div>

              {showNoteForm && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <NoteForm
                    stakeholderId={stakeholder.id}
                    onNoteAdded={handleNoteAdded}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNoteForm(false)}
                    className="mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <NoteTimeline
                notes={notes}
                onNoteUpdated={onNoteUpdated}
                onNoteDeleted={onNoteDeleted}
              />
            </div>
          </div>
        </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

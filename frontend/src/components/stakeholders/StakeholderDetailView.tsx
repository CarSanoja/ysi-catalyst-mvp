/**
 * StakeholderDetailView Component
 * Full-page view displaying stakeholder information with notes
 */

import { useState } from 'react';
import { Stakeholder, Note } from '../../types/stakeholder';
import { stakeholderTypeConfigs } from '../../types/stakeholder';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { NoteTimeline } from './NoteTimeline';
import { NoteForm } from './NoteForm';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Tag,
  Link as LinkIcon,
  User,
  Calendar,
  Edit,
  StickyNote
} from 'lucide-react';

interface StakeholderDetailViewProps {
  stakeholder: Stakeholder | null;
  notes: Note[];
  onBack: () => void;
  onEdit: (stakeholder: Stakeholder) => void;
  onNoteAdded: (note: Note) => void;
  onNoteUpdated: (note: Note) => void;
  onNoteDeleted: (noteId: string) => void;
}

export function StakeholderDetailView({
  stakeholder,
  notes,
  onBack,
  onEdit,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted
}: StakeholderDetailViewProps) {
  const [showNoteForm, setShowNoteForm] = useState(false);

  if (!stakeholder) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No stakeholder selected</p>
      </div>
    );
  }

  const typeConfig = stakeholderTypeConfigs[stakeholder.type];

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
    <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8 animate-in fade-in duration-300">
      {/* Hero Header with Gradient Background */}
      <div className="relative -mx-6 lg:-mx-12 -mt-8 mb-10 px-6 lg:px-12 pt-10 pb-8 bg-gradient-to-br from-[#0077B6]/10 via-white to-[#A8E6CF]/10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            style={{
              backgroundColor: 'white',
              color: '#0077B6'
            }}
            className="gap-2 hover:!bg-[#0077B6] hover:!text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
          <Button
            onClick={() => onEdit(stakeholder)}
            variant="ghost"
            style={{
              background: 'linear-gradient(to right, #0077B6, #005a8c)',
              color: 'white'
            }}
            className="gap-2 hover:shadow-lg transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0077B6] to-[#C3B1E1] flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {stakeholder.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{stakeholder.name}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  className="text-sm px-3 py-1"
                  style={{
                    backgroundColor: typeConfig.bgColor,
                    color: typeConfig.color,
                    fontWeight: 600
                  }}
                >
                  {typeConfig.icon} {typeConfig.label}
                </Badge>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4 text-[#0077B6]" />
                  <span className="font-medium">{stakeholder.organization}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-[#FF6B6B]" />
                  <span>{stakeholder.region}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1">
          <div className="p-8 space-y-6 bg-gradient-to-br from-white via-[#0077B6]/[0.02] to-[#C3B1E1]/[0.03] rounded-3xl overflow-hidden relative">
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#0077B6] via-[#C3B1E1] to-[#A8E6CF]" />

            {/* Contact Info */}
            <div className="space-y-4 pl-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-[#0077B6] to-[#005a8c] rounded-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-base text-gray-900">Contact Information</h3>
              </div>

              <div className="flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-[#0077B6]/5 to-transparent rounded-lg hover:from-[#0077B6]/10 transition-all">
                <div className="p-2 bg-white rounded-lg border border-[#0077B6]/20">
                  <Briefcase className="w-4 h-4 text-[#0077B6]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Role</p>
                  <p className="font-semibold text-gray-900">{stakeholder.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-[#C3B1E1]/5 to-transparent rounded-lg hover:from-[#C3B1E1]/10 transition-all">
                <div className="p-2 bg-white rounded-lg border border-[#C3B1E1]/20">
                  <Building className="w-4 h-4 text-[#C3B1E1]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Organization</p>
                  <p className="font-semibold text-gray-900">{stakeholder.organization}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-[#FF6B6B]/5 to-transparent rounded-lg hover:from-[#FF6B6B]/10 transition-all">
                <div className="p-2 bg-white rounded-lg border border-[#FF6B6B]/20">
                  <MapPin className="w-4 h-4 text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Region</p>
                  <p className="font-semibold text-gray-900">{stakeholder.region}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-[#0077B6]/5 to-transparent rounded-lg hover:from-[#0077B6]/10 transition-all group">
                <div className="p-2 bg-white rounded-lg border border-[#0077B6]/20">
                  <Mail className="w-4 h-4 text-[#0077B6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <a
                    href={`mailto:${stakeholder.email}`}
                    className="font-semibold text-[#0077B6] hover:underline group-hover:text-[#005a8c] break-all"
                  >
                    {stakeholder.email}
                  </a>
                </div>
              </div>

              {stakeholder.phone && (
                <div className="flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-[#A8E6CF]/5 to-transparent rounded-lg hover:from-[#A8E6CF]/10 transition-all group">
                  <div className="p-2 bg-white rounded-lg border border-[#A8E6CF]/20">
                    <Phone className="w-4 h-4 text-[#A8E6CF]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <a
                      href={`tel:${stakeholder.phone}`}
                      className="font-semibold text-[#0077B6] hover:underline group-hover:text-[#005a8c]"
                    >
                      {stakeholder.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Separator className="ml-3" />

            {/* Bio */}
            {stakeholder.bio && (
              <>
                <div className="space-y-3 pl-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-[#C3B1E1] to-[#9B8CC7] rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">Bio</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed p-4 bg-gradient-to-br from-[#C3B1E1]/5 to-transparent rounded-lg border-l-4 border-[#C3B1E1]">
                    {stakeholder.bio}
                  </p>
                </div>
                <Separator className="ml-3" />
              </>
            )}

            {/* Tags */}
            {stakeholder.tags.length > 0 && (
              <>
                <div className="space-y-3 pl-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-[#A8E6CF] to-[#7FCDAA] rounded-lg">
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stakeholder.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        className="text-xs px-3 py-1.5 bg-gradient-to-r from-[#A8E6CF] to-[#7FCDAA] text-white border-none hover:shadow-md transition-all"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator className="ml-3" />
              </>
            )}

            {/* Links */}
            {stakeholder.links.length > 0 && (
              <>
                <div className="space-y-3 pl-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-[#FF6B6B] to-[#E05555] rounded-lg">
                      <LinkIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">Links</h3>
                  </div>
                  <div className="space-y-2">
                    {stakeholder.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#FF6B6B]/5 to-transparent rounded-lg hover:from-[#FF6B6B]/10 hover:shadow-sm transition-all group"
                      >
                        <div className="p-1.5 bg-white rounded border border-[#FF6B6B]/20">
                          <LinkIcon className="w-3 h-3 text-[#FF6B6B]" />
                        </div>
                        <span className="text-sm text-[#0077B6] group-hover:text-[#005a8c] font-medium">
                          {link.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
                <Separator className="ml-3" />
              </>
            )}

            {/* Audit Info */}
            <div className="space-y-2 pl-3 pt-2">
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span className="text-xs font-semibold text-gray-700">Audit Trail</span>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span>Created by <span className="font-medium text-gray-700">{stakeholder.created_by}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>Created <span className="font-medium text-gray-700">{formatDate(stakeholder.created_at)}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>Updated <span className="font-medium text-gray-700">{formatDate(stakeholder.updated_at)}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notes */}
        <div className="lg:col-span-2">
          <div className="p-8 space-y-6 bg-gradient-to-br from-white via-[#C3B1E1]/[0.02] to-[#A8E6CF]/[0.03] rounded-3xl overflow-hidden relative">
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0077B6] via-[#C3B1E1] to-[#A8E6CF]" />

            {/* Notes Header */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#0077B6] to-[#005a8c] rounded-lg shadow-md">
                  <StickyNote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">
                    Interaction Log
                  </h3>
                  <p className="text-sm text-gray-500">{notes.length} total interactions</p>
                </div>
              </div>
              {!showNoteForm && (
                <Button
                  size="sm"
                  onClick={() => setShowNoteForm(true)}
                  variant="ghost"
                  style={{
                    background: 'linear-gradient(to right, #0077B6, #005a8c)',
                    color: 'white'
                  }}
                  className="gap-2 hover:shadow-lg transition-all"
                >
                  <StickyNote className="w-4 h-4" />
                  Add Note
                </Button>
              )}
            </div>

            {showNoteForm && (
              <div className="bg-gradient-to-br from-[#0077B6]/5 via-[#C3B1E1]/5 to-transparent rounded-2xl p-6">
                <NoteForm
                  stakeholderId={stakeholder.id}
                  onNoteAdded={handleNoteAdded}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNoteForm(false)}
                  className="mt-3 border-[#0077B6]/30 text-[#0077B6] hover:bg-[#0077B6]/10"
                >
                  Cancel
                </Button>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full mb-4">
                    <StickyNote className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No notes yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first note to start tracking interactions</p>
                </div>
              ) : (
                <NoteTimeline
                  notes={notes}
                  onNoteUpdated={onNoteUpdated}
                  onNoteDeleted={onNoteDeleted}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * StakeholderDirectory Component
 * Main component for stakeholder management with search, filters, and CRUD operations
 */

import { useState, useEffect } from 'react';
import { Stakeholder, Note, StakeholderFilters, StakeholderType, StakeholderFormData } from '../types/stakeholder';
import { api } from '../services/api';
import { StakeholderTable } from './stakeholders/StakeholderTable';
import { StakeholderDetailView } from './stakeholders/StakeholderDetailView';
import { StakeholderFormView } from './stakeholders/StakeholderFormView';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, UserPlus, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

export function StakeholderDirectory() {
  // State
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [filters, setFilters] = useState<StakeholderFilters>({
    search: '',
    type: undefined,
    region: undefined
  });

  // Load stakeholders on component mount
  useEffect(() => {
    const loadStakeholders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.stakeholders.getAll();
        if (response.success && response.data) {
          setStakeholders(response.data);
        } else {
          setError('Failed to load stakeholders');
        }
      } catch (err) {
        setError('Error loading stakeholders: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadStakeholders();
  }, []);

  // Load notes for selected stakeholder
  useEffect(() => {
    const loadNotes = async () => {
      if (!selectedStakeholder) {
        setNotes([]);
        return;
      }

      try {
        const response = await api.stakeholders.getNotes(selectedStakeholder.id);
        if (response.success && response.data) {
          setNotes(response.data);
        }
      } catch (err) {
        console.error('Error loading stakeholder notes:', err);
        // Don't show error toast for notes, just log it
      }
    };

    loadNotes();
  }, [selectedStakeholder]);

  // Get unique regions from loaded stakeholders
  const uniqueRegions = Array.from(new Set(stakeholders.map(s => s.region))).sort();

  // Filtered stakeholders
  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = filters.search === '' ||
      stakeholder.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      stakeholder.organization.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType = !filters.type || stakeholder.type === filters.type;
    const matchesRegion = !filters.region || stakeholder.region === filters.region;

    return matchesSearch && matchesType && matchesRegion;
  });

  const stakeholderNotes = selectedStakeholder ? notes : [];

  // Handlers
  const handleSelectStakeholder = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedStakeholder(null);
  };

  const handleCreateNew = () => {
    setFormMode('create');
    setSelectedStakeholder(null);
    setViewMode('form');
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setFormMode('edit');
    setSelectedStakeholder(stakeholder);
    setViewMode('form');
  };

  const handleBackFromForm = () => {
    setViewMode('list');
    setSelectedStakeholder(null);
  };

  const handleFormSubmit = async (data: StakeholderFormData) => {
    try {
      if (formMode === 'create') {
        // Create new stakeholder
        const response = await api.stakeholders.create({
          ...data,
          created_by: 'current_user'
        });

        if (response.success && response.data) {
          setStakeholders(prev => [response.data, ...prev]);
          toast.success('Stakeholder created successfully');
        } else {
          toast.error('Failed to create stakeholder');
          return;
        }
      } else if (formMode === 'edit' && selectedStakeholder) {
        // Update existing stakeholder
        const response = await api.stakeholders.update(selectedStakeholder.id, data);

        if (response.success && response.data) {
          setStakeholders(prev =>
            prev.map(s => s.id === selectedStakeholder.id ? response.data : s)
          );

          // Update selected stakeholder if we're viewing it
          if (viewMode === 'detail') {
            setSelectedStakeholder(response.data);
          }
          toast.success('Stakeholder updated successfully');
        } else {
          toast.error('Failed to update stakeholder');
          return;
        }
      }

      // Go back to list after successful submit
      setViewMode('list');
      setSelectedStakeholder(null);
    } catch (err) {
      toast.error('Error saving stakeholder: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleNoteAdded = async (noteData: { content: string }) => {
    if (!selectedStakeholder) return;

    try {
      const response = await api.stakeholders.createNote(selectedStakeholder.id, {
        ...noteData,
        created_by: 'current_user'
      });

      if (response.success && response.data) {
        setNotes(prev => [response.data, ...prev]);
        toast.success('Note added successfully');
      } else {
        toast.error('Failed to add note');
      }
    } catch (err) {
      toast.error('Error adding note: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleNoteUpdated = async (noteId: string, noteData: { content: string }) => {
    if (!selectedStakeholder) return;

    try {
      const response = await api.stakeholders.updateNote(selectedStakeholder.id, noteId, noteData);

      if (response.success && response.data) {
        setNotes(prev =>
          prev.map(note => note.id === noteId ? response.data : note)
        );
        toast.success('Note updated successfully');
      } else {
        toast.error('Failed to update note');
      }
    } catch (err) {
      toast.error('Error updating note: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleNoteDeleted = async (noteId: string) => {
    if (!selectedStakeholder) return;

    try {
      const response = await api.stakeholders.deleteNote(selectedStakeholder.id, noteId);

      if (response.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        toast.success('Note deleted successfully');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (err) {
      toast.error('Error deleting note: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };


  // Form View
  if (viewMode === 'form') {
    return (
      <StakeholderFormView
        mode={formMode}
        stakeholder={selectedStakeholder}
        onBack={handleBackFromForm}
        onSubmit={handleFormSubmit}
      />
    );
  }

  // Detail View
  if (viewMode === 'detail') {
    return (
      <StakeholderDetailView
        stakeholder={selectedStakeholder}
        notes={stakeholderNotes}
        onBack={handleBackToList}
        onEdit={handleEdit}
        onNoteAdded={handleNoteAdded}
        onNoteUpdated={handleNoteUpdated}
        onNoteDeleted={handleNoteDeleted}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-muted-foreground">Loading stakeholders...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto">
        <p className="text-muted-foreground">
          Manage and track relationships with key stakeholders across the global network
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-row flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or organization..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => setFilters(prev => ({
            ...prev,
            type: value === 'all' ? undefined : value as StakeholderType
          }))}
        >
          <SelectTrigger className="w-auto min-w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="funder">Funder</SelectItem>
            <SelectItem value="implementer">Implementer</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="policymaker">Policymaker</SelectItem>
            <SelectItem value="researcher">Researcher</SelectItem>
            <SelectItem value="community_leader">Community Leader</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.region || 'all'}
          onValueChange={(value) => setFilters(prev => ({
            ...prev,
            region: value === 'all' ? undefined : value
          }))}
        >
          <SelectTrigger className="w-auto min-w-[160px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
            <SelectItem value="all">All Regions</SelectItem>
            {uniqueRegions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          style={{
            background: 'linear-gradient(to right, #0077B6, #005a8c)',
            color: 'white'
          }}
          className="gap-2 whitespace-nowrap hover:shadow-lg transition-all"
          onClick={handleCreateNew}
        >
          <UserPlus className="w-4 h-4" />
          New Stakeholder
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4" />
          <span>
            Showing <strong>{filteredStakeholders.length}</strong> of <strong>{stakeholders.length}</strong> stakeholders
          </span>
        </div>
      </div>

      {/* Table */}
      <StakeholderTable
        stakeholders={filteredStakeholders}
        onSelectStakeholder={handleSelectStakeholder}
      />
    </div>
  );
}

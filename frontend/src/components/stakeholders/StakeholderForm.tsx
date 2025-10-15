/**
 * StakeholderForm Component
 * Form modal for creating and editing stakeholders
 */

import { useState, useEffect } from 'react';
import { Stakeholder, StakeholderFormData, StakeholderType, stakeholderTypeConfigs, StakeholderLink } from '../../types/stakeholder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Plus, Loader2, Save, UserPlus, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

// Predefined regions list
const PREDEFINED_REGIONS = [
  'Global',
  '---', // Separator
  'Africa',
  'Asia',
  'Europe',
  'Latin America',
  'Middle East',
  'North America',
  'Oceania',
  '---', // Separator
  'Austria',
  'Brazil',
  'Ethiopia',
  'France',
  'Germany',
  'India',
  'Kenya',
  'Singapore',
  'United Arab Emirates',
  '---', // Separator
  'Other (Custom)'
];

interface StakeholderFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  stakeholder?: Stakeholder | null;
  onClose: () => void;
  onSubmit: (data: StakeholderFormData) => void;
}

export function StakeholderForm({ open, mode, stakeholder, onClose, onSubmit }: StakeholderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StakeholderFormData>({
    name: '',
    role: '',
    organization: '',
    type: 'funder',
    region: '',
    email: '',
    phone: '',
    bio: '',
    tags: [],
    links: []
  });
  const [showCustomRegion, setShowCustomRegion] = useState(false);
  const [customRegion, setCustomRegion] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState({ label: '', url: '' });

  // Load stakeholder data when editing
  useEffect(() => {
    if (mode === 'edit' && stakeholder) {
      // Check if region is in predefined list
      const isCustomRegion = !PREDEFINED_REGIONS.includes(stakeholder.region);

      setFormData({
        name: stakeholder.name,
        role: stakeholder.role,
        organization: stakeholder.organization,
        type: stakeholder.type,
        region: isCustomRegion ? 'Other (Custom)' : stakeholder.region,
        email: stakeholder.email,
        phone: stakeholder.phone || '',
        bio: stakeholder.bio,
        tags: stakeholder.tags,
        links: stakeholder.links
      });

      if (isCustomRegion) {
        setShowCustomRegion(true);
        setCustomRegion(stakeholder.region);
      } else {
        setShowCustomRegion(false);
        setCustomRegion('');
      }
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        role: '',
        organization: '',
        type: 'funder',
        region: '',
        email: '',
        phone: '',
        bio: '',
        tags: [],
        links: []
      });
      setShowCustomRegion(false);
      setCustomRegion('');
    }
  }, [mode, stakeholder, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get final region value
    const finalRegion = showCustomRegion ? customRegion.trim() : formData.region;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.role.trim()) {
      toast.error('Role is required');
      return;
    }
    if (!formData.organization.trim()) {
      toast.error('Organization is required');
      return;
    }
    if (!finalRegion) {
      toast.error('Region is required');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Submit with final region value
    onSubmit({
      ...formData,
      region: finalRegion
    });
    setIsSubmitting(false);
    onClose();
    toast.success(mode === 'create' ? 'Stakeholder created successfully' : 'Stakeholder updated successfully');
  };

  const handleRegionChange = (value: string) => {
    if (value === 'Other (Custom)') {
      setShowCustomRegion(true);
      setFormData(prev => ({ ...prev, region: value }));
    } else {
      setShowCustomRegion(false);
      setCustomRegion('');
      setFormData(prev => ({ ...prev, region: value }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddLink = () => {
    if (newLink.label.trim() && newLink.url.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, { label: newLink.label.trim(), url: newLink.url.trim() }]
      }));
      setNewLink({ label: '', url: '' });
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#0077B6] to-[#005a8c] bg-clip-text text-transparent">
            {mode === 'create' ? 'Create New Stakeholder' : 'Edit Stakeholder'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new stakeholder to your network. Fill in the details below.'
              : 'Update stakeholder information. Changes will be saved immediately.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#0077B6] to-[#C3B1E1] rounded-full" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role/Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="CEO, Director, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">
                  Organization <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Organization name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as StakeholderType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
                    {Object.entries(stakeholderTypeConfigs).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.icon} {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">
                  Region/Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.region}
                  onValueChange={handleRegionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region or country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 shadow-lg max-h-[300px]">
                    {PREDEFINED_REGIONS.map((region, idx) => {
                      if (region === '---') {
                        return <div key={`sep-${idx}`} className="border-t border-gray-200 my-1" />;
                      }
                      return (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {showCustomRegion && (
                  <Input
                    id="custom-region"
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    placeholder="Enter custom region/country"
                    className="mt-2"
                    required
                  />
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#C3B1E1] to-[#A8E6CF] rounded-full" />
              Bio
            </h3>
            <div className="space-y-2">
              <Label htmlFor="bio">Brief description</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="A brief description of the stakeholder..."
                rows={4}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#A8E6CF] to-[#FF6B6B] rounded-full" />
              Tags
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  size="sm"
                  variant="ghost"
                  style={{ backgroundColor: '#A8E6CF', color: 'white' }}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#A8E6CF] to-[#7FCDAA] text-white rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#FF6B6B] to-[#0077B6] rounded-full" />
              Links
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  value={newLink.label}
                  onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Label (e.g., LinkedIn)"
                />
                <div className="flex gap-2">
                  <Input
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="URL"
                  />
                  <Button
                    type="button"
                    onClick={handleAddLink}
                    size="sm"
                    variant="ghost"
                    style={{ backgroundColor: '#FF6B6B', color: 'white' }}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {formData.links.length > 0 && (
                <div className="space-y-2">
                  {formData.links.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FF6B6B]/10 to-transparent rounded-lg border border-[#FF6B6B]/20"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-[#FF6B6B]" />
                        <span className="font-medium text-sm">{link.label}</span>
                        <span className="text-xs text-gray-500">→</span>
                        <span className="text-sm text-[#0077B6] truncate max-w-[200px]">{link.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="p-1 hover:bg-red-100 rounded-full"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="ghost"
              style={{
                background: 'linear-gradient(to right, #0077B6, #005a8c)',
                color: 'white'
              }}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {mode === 'create' ? <UserPlus className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {mode === 'create' ? 'Create Stakeholder' : 'Save Changes'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

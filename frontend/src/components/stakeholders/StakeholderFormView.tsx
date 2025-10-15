/**
 * StakeholderFormView Component
 * Full-page form for creating and editing stakeholders (no modal)
 */

import { useState, useEffect } from 'react';
import { Stakeholder, StakeholderFormData, StakeholderType, stakeholderTypeConfigs } from '../../types/stakeholder';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, X, Plus, Loader2, Save, UserPlus, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

// Predefined regions list
const PREDEFINED_REGIONS = [
  'Global',
  '---',
  'Africa',
  'Asia',
  'Europe',
  'Latin America',
  'Middle East',
  'North America',
  'Oceania',
  '---',
  'Austria',
  'Brazil',
  'Ethiopia',
  'France',
  'Germany',
  'India',
  'Kenya',
  'Singapore',
  'United Arab Emirates',
  '---',
  'Other (Custom)'
];

interface StakeholderFormViewProps {
  mode: 'create' | 'edit';
  stakeholder?: Stakeholder | null;
  onBack: () => void;
  onSubmit: (data: StakeholderFormData) => void;
}

export function StakeholderFormView({ mode, stakeholder, onBack, onSubmit }: StakeholderFormViewProps) {
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
      }
    } else {
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
  }, [mode, stakeholder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    await new Promise(resolve => setTimeout(resolve, 500));

    onSubmit({
      ...formData,
      region: finalRegion
    });

    setIsSubmitting(false);
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
    <div className="max-w-5xl mx-auto px-8 lg:px-16 space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative -mx-8 lg:-mx-16 -mt-8 mb-12 px-8 lg:px-16 pt-10 pb-8 bg-gradient-to-br from-[#0077B6]/10 via-white to-[#A8E6CF]/10">
        <div className="flex items-center gap-6">
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
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#0077B6] to-[#005a8c] bg-clip-text text-transparent mb-2">
              {mode === 'create' ? 'Create New Stakeholder' : 'Edit Stakeholder'}
            </h2>
            <p className="text-base text-gray-600">
              {mode === 'create'
                ? 'Add a new stakeholder to your network'
                : 'Update stakeholder information'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-[#0077B6]/5 via-white to-transparent p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#0077B6] to-[#C3B1E1] rounded-xl">
                <div className="w-5 h-5 bg-white rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <SelectContent className="bg-white">
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
                  <SelectContent className="bg-white max-h-[300px]">
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
          <div className="bg-gradient-to-br from-[#C3B1E1]/5 via-white to-transparent p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#C3B1E1] to-[#A8E6CF] rounded-xl">
                <div className="w-5 h-5 bg-white rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Bio</h3>
            </div>
            <div className="space-y-3">
              <Label htmlFor="bio" className="text-base font-medium">Brief description</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="A brief description of the stakeholder..."
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gradient-to-br from-[#A8E6CF]/5 via-white to-transparent p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#A8E6CF] to-[#7FCDAA] rounded-xl">
                <div className="w-5 h-5 bg-white rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Tags</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="ghost"
                  style={{ backgroundColor: '#A8E6CF', color: 'white' }}
                  className="shrink-0 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {formData.tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A8E6CF] to-[#7FCDAA] text-white rounded-full text-sm font-medium"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-white/20 rounded-full p-1 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="bg-gradient-to-br from-[#FF6B6B]/5 via-white to-transparent p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#FF6B6B] to-[#E05555] rounded-xl">
                <div className="w-5 h-5 bg-white rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Links</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={newLink.label}
                  onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Label (e.g., LinkedIn)"
                />
                <div className="flex gap-3">
                  <Input
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddLink}
                    variant="ghost"
                    style={{ backgroundColor: '#FF6B6B', color: 'white' }}
                    className="shrink-0 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              {formData.links.length > 0 && (
                <div className="space-y-3 mt-4">
                  {formData.links.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FF6B6B]/10 to-transparent rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FF6B6B]/10 rounded-lg">
                          <LinkIcon className="w-4 h-4 text-[#FF6B6B]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-gray-900">{link.label}</span>
                          <span className="text-xs text-[#0077B6] truncate max-w-[300px]">{link.url}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4 pb-2 bg-gradient-to-r from-gray-50/50 to-transparent px-6 py-6 rounded-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-6 py-2.5"
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
              className="gap-2 px-8 py-2.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {mode === 'create' ? <UserPlus className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  {mode === 'create' ? 'Create Stakeholder' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

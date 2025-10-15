import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Edit, Check, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { EditableListProps } from '../../types';

export function EditableList({
  label,
  items,
  onSave,
  placeholder = "Add new item...",
  disabled = false,
  maxItems,
}: EditableListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<string[]>(items);
  const [newItem, setNewItem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editItems when items prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditItems(items);
    }
  }, [items, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
    setNewItem('');
  };

  const handleCancel = () => {
    setEditItems(items);
    setNewItem('');
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    // Filter out empty items and duplicates
    const cleanedItems = [...new Set(editItems.filter(item => item.trim().length > 0))];

    // Check if there are actually changes
    const hasChanges = JSON.stringify(cleanedItems.sort()) !== JSON.stringify(items.sort());
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(cleanedItems);
      setIsEditing(false);
      setNewItem('');
    } catch (error) {
      console.error('Failed to save list:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    const trimmedItem = newItem.trim();
    if (trimmedItem && !editItems.includes(trimmedItem)) {
      if (maxItems && editItems.length >= maxItems) {
        setError(`Maximum ${maxItems} items allowed`);
        return;
      }
      setEditItems([...editItems, trimmedItem]);
      setNewItem('');
      setError(null);
    }
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
    setError(null);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index] = value;
    setEditItems(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItem.trim()) {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {!isEditing && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            style={{ color: '#0077B6' }}
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {/* Existing Items */}
          <div className="space-y-2">
            {editItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Item */}
          {(!maxItems || editItems.length < maxItems) && (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddItem}
                disabled={isLoading || !newItem.trim() || editItems.includes(newItem.trim())}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {maxItems && (
            <p className="text-xs text-gray-500">
              {editItems.length} of {maxItems} items
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white h-7 px-3"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-7 px-3"
            >
              <X className="w-3 h-3" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`p-3 rounded border min-h-[60px] cursor-pointer transition-colors ${
            disabled
              ? 'bg-gray-50 border-gray-200 cursor-default'
              : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
          onClick={handleEdit}
        >
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border-blue-300"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Click to add items...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
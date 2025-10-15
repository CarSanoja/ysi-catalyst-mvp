import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Edit, Check, X, Loader2 } from 'lucide-react';
import { EditableFieldProps } from '../../types';

export function EditableField({
  label,
  value,
  onSave,
  multiline = false,
  placeholder,
  disabled = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Update editValue when value prop changes (for optimistic updates)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy editing
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    if (editValue.trim().length === 0) {
      setError('Field cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save field:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
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
        <div className="space-y-2">
          <InputComponent
            ref={inputRef as any}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full ${error ? 'border-red-500 focus:border-red-500' : 'border-blue-300 focus:border-blue-500'}`}
            disabled={isLoading}
            {...(multiline ? { rows: 3 } : {})}
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading || editValue.trim().length === 0}
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
          className={`p-2 rounded border min-h-[40px] cursor-pointer transition-colors ${
            disabled
              ? 'bg-gray-50 border-gray-200 cursor-default'
              : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
          onClick={handleEdit}
        >
          <p className={`text-sm ${value ? 'text-gray-900' : 'text-gray-500 italic'}`}>
            {value || placeholder || 'Click to edit...'}
          </p>
        </div>
      )}
    </div>
  );
}
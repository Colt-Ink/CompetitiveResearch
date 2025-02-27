'use client';

import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

interface FloristNotesProps {
  floristId: string;
  initialNotes?: string;
  onSave?: (notes: string) => Promise<void>;
}

export default function FloristNotes({ 
  floristId, 
  initialNotes = '', 
  onSave 
}: FloristNotesProps) {
  // Store notes in localStorage to persist across sessions
  const [localNotes, setLocalNotes] = useLocalStorage(`florist-notes-${floristId}`, initialNotes);
  
  // Track if we're in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // Track if we're saving to the server
  const [isSaving, setIsSaving] = useState(false);
  // Track temporary notes while editing
  const [tempNotes, setTempNotes] = useState(localNotes);
  
  const handleEdit = () => {
    setTempNotes(localNotes);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    setLocalNotes(tempNotes);
    setIsEditing(false);
    
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(tempNotes);
      } catch (error) {
        console.error('Failed to save notes:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Personal Notes</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-700"
          >
            Edit
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-700"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <textarea
          value={tempNotes}
          onChange={(e) => setTempNotes(e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={5}
          placeholder="Add your personal notes about this florist here..."
        />
      ) : (
        <div className="prose">
          {localNotes ? (
            <p className="whitespace-pre-wrap">{localNotes}</p>
          ) : (
            <p className="text-gray-500 italic">No notes yet. Click Edit to add some.</p>
          )}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Notes are stored locally in your browser and will persist across visits.
      </div>
    </div>
  );
}

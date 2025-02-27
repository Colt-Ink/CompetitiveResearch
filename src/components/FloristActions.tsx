'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useOnClickOutside } from 'usehooks-ts';

interface FloristActionsProps {
  floristId: string;
  onDelete?: () => Promise<void>;
}

export default function FloristActions({ floristId, onDelete }: FloristActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false));
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this florist? This action cannot be undone.')) {
      if (onDelete) {
        setIsDeleting(true);
        try {
          await onDelete();
        } catch (error) {
          console.error('Failed to delete florist:', error);
          setIsDeleting(false);
        }
      }
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
      >
        Actions
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <Link
              href={`/florists/${floristId}/edit`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Edit Florist
            </Link>
            <Link
              href={`/map?highlight=${floristId}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              View on Map
            </Link>
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Florist'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

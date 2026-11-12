import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <MagnifyingGlass className="text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent border-none focus:ring-0"
          />
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

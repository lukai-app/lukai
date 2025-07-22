'use client';
import { useMemo, useState } from 'react';
import { useSession } from '@/app/_components/session-provider';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';

interface MobileTagSelectorProps {
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  showAll?: boolean;
}

export const MobileTagSelector: React.FC<MobileTagSelectorProps> = ({
  selectedTag,
  setSelectedTag,
  showAll = true,
}) => {
  const { session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const tags = useMemo(() => {
    return session?.user?.tags || [];
  }, [session?.user?.tags]);

  const selectedTagLabel = useMemo(() => {
    if (selectedTag === 'all') return 'tags';

    const tag = tags.find((t) => t.id === selectedTag);
    return tag ? tag.name : 'tags';
  }, [selectedTag, tags]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="truncate">
          <span className="truncate">{selectedTagLabel}</span>{' '}
          <ChevronDownIcon className="w-4 h-4 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#05060A] border">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-left text-3xl font-bold">
            tags
          </DialogTitle>
        </DialogHeader>
        <div className="bg-[#1a1a1a] overflow-y-auto rounded-3xl mb-4 p-6 max-w-md">
          <div className="grid grid-cols-3 gap-4">
            {showAll && (
              <button
                onClick={() => {
                  setSelectedTag('all');
                  setIsOpen(false);
                }}
                className={`
                py-4 rounded-xl text-lg text-center transition-colors
                ${selectedTag === 'all' ? 'font-bold bg-yc-700' : 'font-medium'}
              `}
              >
                todas
              </button>
            )}
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTag(tag.id);
                  setIsOpen(false);
                }}
                className={`
                  py-4 rounded-xl text-base text-center transition-colors
                  ${
                    selectedTag === tag.id
                      ? 'font-bold bg-yc-700'
                      : 'font-medium'
                  }
                `}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

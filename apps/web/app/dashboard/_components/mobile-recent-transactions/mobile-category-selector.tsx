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

interface MobileCategorySelectorProps {
  selectedTab: 'expense' | 'income';
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showAll?: boolean;
  mode?: 'id' | 'label';
}

export const MobileCategorySelector: React.FC<MobileCategorySelectorProps> = ({
  selectedTab,
  selectedCategory,
  setSelectedCategory,
  showAll = true,
  mode = 'label',
}) => {
  const { session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const categories = useMemo(() => {
    if (selectedTab === 'expense') {
      return session?.user?.expense_categories || [];
    } else {
      return session?.user?.income_categories || [];
    }
  }, [
    session?.user?.expense_categories,
    session?.user?.income_categories,
    selectedTab,
  ]);

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'categorías';

    const category = categories.find((cat) =>
      mode === 'id'
        ? cat.value === selectedCategory
        : cat.label.toLowerCase() === selectedCategory.toLowerCase()
    );
    return category ? category.label : 'categorías';
  }, [selectedCategory, categories, mode]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="truncate">
          <span className="truncate">{selectedCategoryLabel}</span>{' '}
          <ChevronDownIcon className="w-4 h-4 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#05060A] border">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-left text-3xl font-bold">
            categorías
          </DialogTitle>
        </DialogHeader>
        <div className="bg-[#1a1a1a] overflow-y-auto rounded-3xl mb-4 p-6 max-w-md">
          <div className="grid grid-cols-3 gap-4">
            {showAll && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setIsOpen(false);
                }}
                className={`
                py-4 rounded-xl text-lg text-center transition-colors
                ${
                  selectedCategory === 'all'
                    ? `font-bold ${
                        selectedTab === 'expense' ? 'bg-yc-700' : 'bg-lemon-950'
                      }`
                    : 'font-medium'
                }
              `}
              >
                todas
              </button>
            )}
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => {
                  setSelectedCategory(
                    mode === 'id' ? category.value : category.label
                  );
                  setIsOpen(false);
                }}
                className={`
                  py-4 rounded-xl text-base text-center transition-colors
                  ${
                    selectedCategory ===
                    (mode === 'id' ? category.value : category.label)
                      ? `font-bold ${
                          selectedTab === 'expense'
                            ? 'bg-yc-700'
                            : 'bg-lemon-950'
                        }`
                      : 'font-medium'
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

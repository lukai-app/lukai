'use client';

import { useState } from 'react';
import { MobilePromptInput } from './MobilePromptInput';
import { MobileSuggestionsSheet } from './MobileSuggestionsSheet';

export const MobileInputContainer: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <MobilePromptInput
        onFocus={() => setIsSheetOpen(true)}
        onBlur={() => {
          // We don't want to close the sheet immediately on blur
          // as the user might be trying to click a suggestion
          setTimeout(() => {
            setIsSheetOpen(false);
          }, 100);
        }}
      />
      <MobileSuggestionsSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  );
};

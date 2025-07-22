import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import { MonthSelectorSheet } from './home/month-selector-sheet';
import { MobileCategorySelector } from './home/mobile-category-selector-sheet';
import {
  MobileDateRangePicker,
  DateRange,
} from './home/mobile-date-range-picker-sheet';
import { CountrySelectorSheet } from '@/components/settings/country-selector-sheet';
import { Country } from '@/components/settings/country-selector-trigger';
import { LanguageSelectorSheet } from '@/components/settings/language-selector-sheet';
import { CurrencySelectorSheet } from '@/components/settings/currency-selector-sheet';
import { LocaleSelectorSheet } from '@/components/settings/locale-selector-sheet';
import { TimezoneSelectorSheet } from '@/components/settings/timezone-selector-sheet';
import { LegalSelectorSheet } from '@/components/settings/legal-selector-sheet';
import { CountryCodeSheet } from '@/components/auth/country-code-sheet';
import { Country as CountryType } from '@/lib/constants/countries';

registerSheet('month-selector', MonthSelectorSheet);
registerSheet('category-selector', MobileCategorySelector);
registerSheet('date-range-picker', MobileDateRangePicker);
registerSheet('country-selector', CountrySelectorSheet);
registerSheet('language-selector', LanguageSelectorSheet);
registerSheet('currency-selector', CurrencySelectorSheet);
registerSheet('locale-selector', LocaleSelectorSheet);
registerSheet('timezone-selector', TimezoneSelectorSheet);
registerSheet('legal-selector', LegalSelectorSheet);
registerSheet('country-code', CountryCodeSheet);
// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module 'react-native-actions-sheet' {
  interface Sheets {
    'month-selector': SheetDefinition<{
      payload: {
        locale: string;
        selectedTab: 'expense' | 'income';
        showAmount?: boolean;
      };
    }>;
    'category-selector': SheetDefinition<{
      payload: {
        selectedTab: 'expense' | 'income';
        selectedCategory: string;
        setSelectedCategory: (category: string) => void;
        showAll?: boolean;
        mode?: 'label' | 'id';
      };
    }>;
    'date-range-picker': SheetDefinition<{
      payload: {
        selectedTab: 'expense' | 'income';
        date: DateRange;
        setDate: (date: DateRange) => void;
      };
    }>;
    'country-selector': SheetDefinition<{
      payload: {
        onSelect: (country: Country) => void;
      };
    }>;
    'language-selector': SheetDefinition<{
      payload: {
        onSelect: (language: string) => void;
      };
    }>;
    'currency-selector': SheetDefinition<{
      payload: {
        onSelect: (currency: string) => void;
      };
    }>;
    'locale-selector': SheetDefinition<{
      payload: {
        onSelect: (locale: string) => void;
      };
    }>;
    'timezone-selector': SheetDefinition<{
      payload: {
        onSelect: (timezone: string) => void;
      };
    }>;
    'legal-selector': SheetDefinition<{
      payload: {};
    }>;
    'country-code': SheetDefinition<{
      payload: {
        onSelect: (country: CountryType) => void;
      };
    }>;
  }
}

export {};

'use client';

import { useMemo } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/app/dashboard/_context/app-context';

export const YearSelector: React.FC = () => {
  const { year, setYear } = useAppContext();

  const years = useMemo(
    () => Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i),
    [year]
  );

  return (
    <Select
      value={year.toString()}
      onValueChange={(value) => setYear(Number(value))}
    >
      <SelectTrigger className="w-full h-10">
        <SelectValue placeholder="Seleccionar año" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

'use client';
import DayjsSingleton from '@/lib/helpers/Dayjs';

interface WithCreatedAt {
  created_at: string | Date;
}

interface GroupedByDate<T extends WithCreatedAt> {
  [key: string]: T[];
}
export const groupByDate = <T extends WithCreatedAt>(
  items: T[],
  locale: string
): GroupedByDate<T> => {
  const groups: GroupedByDate<T> = {};
  const dayjs = DayjsSingleton.getInstance(locale);

  for (const item of items) {
    const date = new Date(item.created_at);
    const label = dayjs(date).format('DD [de] MMMM');

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  }

  return groups;
};

export const sortGroupedByDate = <T extends WithCreatedAt>(
  grouped: GroupedByDate<T>
): [string, T[]][] => {
  return Object.entries(grouped).sort(([labelA], [labelB]) => {
    // review the created_at date of the first entry in the group
    const dateA = new Date(grouped[labelA][0].created_at);
    const dateB = new Date(grouped[labelB][0].created_at);

    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }

    return labelB.localeCompare(labelA);
  });
};

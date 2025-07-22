import DayjsSingleton from '../../../lib/helpers/Dayjs';

export function generateCalendar(params: {
  locale: string;
  userTimezone: string;
}) {
  const dayjs = DayjsSingleton.getInstance(params.locale, params.userTimezone);

  const today = dayjs();
  const startDate = today.subtract(10, 'day');
  const endDate = today.add(10, 'day');

  const daysOfWeek = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ];
  const months = [];
  let currentMonth = startDate.month();
  let monthDays: (string | number)[][] = Array(7)
    .fill(null)
    .map(() => []);

  for (
    let date = startDate;
    date.isBefore(endDate);
    date = date.add(1, 'day')
  ) {
    if (date.month() !== currentMonth) {
      months.push({
        month: dayjs().month(currentMonth).format('MMMM'),
        days: monthDays
      });
      monthDays = Array(7)
        .fill(null)
        .map(() => []);
      currentMonth = date.month();
    }
    const dayLabel = date.isSame(today, 'day')
      ? `${date.date()}(today)`
      : date.date();
    monthDays[date.day()].push(dayLabel);
  }
  months.push({
    month: dayjs().month(currentMonth).format('MMMM'),
    days: monthDays
  });

  let result = '';

  months.forEach((month) => {
    result += `${month.month}:\n`;
    month.days.forEach((days, index) => {
      if (days.length > 0) {
        result += `${daysOfWeek[index]} -> ${days.join(', ')}\n`;
      }
    });
  });

  return result;
}

export const generateNextDays = (params: {
  locale: string;
  userTimezone: string;
}) => {
  // return the next 7 days in this format:
  /* 
    mañana: Jueves 15 de Julio 2025
    pasado mañana: Viernes 16 de Julio 2025
    en 3 días (el sábado): Sábado 17 de Julio 202
    en 4 días (el domingo): Domingo 18 de Julio 2025
    en 5 días (el lunes): Lunes 19 de Julio 2025
    en 6 días (el martes): Martes 20 de Julio 2025
    en 7 días (el miércoles): Miércoles 21 de Julio 2025
   */

  const dayjs = DayjsSingleton.getInstance(params.locale, params.userTimezone);

  const today = dayjs();

  let result = '';

  for (let i = 1; i <= 7; i++) {
    const date = today.add(i, 'day');
    const day = date.format('dddd');
    const formattedDate = date.format('D [de] MMMM YYYY');
    const dayLabel =
      i === 1
        ? params.locale.includes('es')
          ? 'mañana'
          : 'tomorrow'
        : i === 2
        ? params.locale.includes('es')
          ? 'pasado mañana'
          : 'day after tomorrow'
        : params.locale.includes('es')
        ? `en ${i} días (el ${day})`
        : `in ${i} days (the ${day})`;

    result += `${dayLabel}: ${day} ${formattedDate}\n`;
  }

  return result;
};

export const generatePastDays = (params: {
  locale: string;
  userTimezone: string;
}) => {
  const { locale, userTimezone } = params;

  const dayjs = DayjsSingleton.getInstance(locale, userTimezone);

  const today = dayjs();

  let result = '';

  for (let i = 0; i <= 7; i++) {
    const date = today.subtract(i, 'day');
    const day = date.format('dddd');
    const formattedDate = date.format('D [de] MMMM YYYY');
    const dayLabel =
      i === 0
        ? locale.includes('es')
          ? 'hoy'
          : 'today'
        : i === 1
        ? locale.includes('es')
          ? 'ayer'
          : 'yesterday'
        : i === 2
        ? locale.includes('es')
          ? 'anteayer'
          : 'day before yesterday'
        : locale.includes('es')
        ? `hace ${i} días (el ${day})`
        : `${i} days ago (the ${day})`;

    result += `${dayLabel}: ${day} ${formattedDate}\n`;
  }

  return result;
};

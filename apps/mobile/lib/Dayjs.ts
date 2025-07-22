import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

class DayjsSingleton {
  private static instance: DayjsSingleton;
  private locale: string;

  private constructor(locale: string) {
    dayjs.extend(updateLocale);
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(weekOfYear);
    dayjs.extend(isoWeek);

    dayjs.updateLocale('es', {
      months: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      weekdays: [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
      ],
    });
    dayjs.tz.guess();

    this.locale = locale;
    this.setLocale(locale);
  }

  public static getInstance(locale: string) {
    if (!DayjsSingleton.instance) {
      DayjsSingleton.instance = new DayjsSingleton(locale);
    }
    return dayjs;
  }

  public setLocale(locale: string): void {
    this.locale = locale;
    this.updateLocale();
  }

  private updateLocale(): void {
    if (this.locale === 'ES') {
      dayjs.locale('es');
    } else {
      dayjs.locale('en');
    }
  }
}

export default DayjsSingleton;

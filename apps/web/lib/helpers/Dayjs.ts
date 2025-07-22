import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

const esLocale = {
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
  monthsShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
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
  weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  weekdaysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
};

class DayjsSingleton {
  private static instance: DayjsSingleton;
  private locale: string;
  private timezone: string;

  private constructor(locale: string, userTimezone?: string) {
    dayjs.extend(updateLocale);
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(weekOfYear);
    dayjs.extend(isoWeek);

    this.locale = locale;
    this.timezone = userTimezone || dayjs.tz.guess();

    if (this.locale.toLowerCase().includes('es')) {
      dayjs.updateLocale(this.locale, esLocale);
    }

    this.setLocale(locale);
    this.setTimezone(this.timezone);
  }

  public static getInstance(locale: string, userTimezone?: string) {
    if (!DayjsSingleton.instance) {
      DayjsSingleton.instance = new DayjsSingleton(locale, userTimezone);
    }
    return dayjs;
  }

  public setLocale(locale: string): void {
    this.locale = locale;

    if (this.locale.toLowerCase().includes('es')) {
      dayjs.updateLocale(this.locale, esLocale);
    }

    this.updateLocale();
  }

  public setTimezone(timezone: string): void {
    this.timezone = timezone;
    dayjs.tz.setDefault(this.timezone);
  }

  public getTimezone(): string {
    return this.timezone;
  }

  private updateLocale(): void {
    dayjs.locale(this.locale);
  }
}

export default DayjsSingleton;

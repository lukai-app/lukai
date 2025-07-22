'use client';
import { useState } from 'react';
import { CalendarDaysIcon, CalendarIcon, XIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import DayjsSingleton from '@/lib/helpers/Dayjs';
import { dictionary } from '@/lib/constants/dictionary';

import { Popover, PopoverTrigger, PopoverContent } from './popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './button';
import { Calendar } from './calendar';

interface CalendarDateRangePickerProps {
  className?: string;
  active?: boolean;
  date?: DateRange;
  setDate?: (date?: DateRange) => void;
  hideClearButton?: boolean;
  lang?: 'en' | 'es';
  buttonClassName?: string;
  iconClassName?: string;
  variant?: 'modal' | 'popover';
}

export function CalendarDateRangePicker({
  className,
  date,
  setDate,
  active,
  hideClearButton,
  lang = 'en',
  buttonClassName,
  iconClassName,
  variant = 'popover',
}: CalendarDateRangePickerProps) {
  const isMobile = useIsMobile();
  const dayjs = DayjsSingleton.getInstance('EN');
  const [localTextFrom, setLocalTextFrom] = useState<string | undefined>(
    date?.from ? format(date.from, 'LLL dd, y') : ''
  );
  const [localTextTo, setLocalTextTo] = useState<string | undefined>(
    date?.to ? format(date.to, 'LLL dd, y') : ''
  );
  const [localDate, setLocalDate] = useState<DateRange | undefined>(date);
  const [selectingStart, setSelectingStart] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [open, setOpen] = useState(false);

  if (!isMobile && variant === 'popover') {
    return (
      <div className={cn('grid gap-2', className)}>
        <Popover
          open={open}
          onOpenChange={(open) => {
            if (!open) {
              setLocalDate(date);
              setLocalTextFrom(
                date?.from ? format(date.from, 'LLL dd, y') : ''
              );
              setLocalTextTo(date?.to ? format(date.to, 'LLL dd, y') : '');
            }
            setOpen(open);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                'justify-start text-left',
                !date && 'text-[#B3B8BC]',
                active && 'border-secondary text-secondary',
                buttonClassName
              )}
              onClick={() => setOpen(!open)}
            >
              <CalendarDaysIcon
                className={cn(
                  'mr-2 h-4 w-4 shrink-0',
                  active ? 'text-secondary' : 'text-[#B3B8BC]',
                  iconClassName
                )}
              />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, yy')} -{' '}
                    {format(date.to, 'LLL dd, yy')}
                    <button
                      className={cn('ml-auto', hideClearButton && 'hidden')}
                      onClick={() => setDate?.(undefined)}
                    >
                      <XIcon
                        className={cn(
                          'h-4 w-4',
                          active ? 'text-secondary' : 'text-[#B3B8BC]'
                        )}
                      />
                    </button>
                  </>
                ) : (
                  <>
                    {format(date.from, 'LLL dd, y')}
                    <button
                      className={cn('ml-auto', hideClearButton && 'hidden')}
                      onClick={() => setDate?.(undefined)}
                    >
                      <XIcon
                        className={cn(
                          'h-4 w-4',
                          active ? 'text-secondary' : 'text-primary'
                        )}
                      />{' '}
                    </button>
                  </>
                )
              ) : (
                <span
                  className={cn(active ? 'text-secondary' : 'text-[#B3B8BC]')}
                >
                  Selecciona un rango de fechas
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            sticky="always"
            autoFocus={false}
            className="min-w-min p-0"
            align="end"
          >
            <div className="ml-auto mt-2 flex gap-2 px-6 py-4">
              <input
                type="text"
                placeholder="Fecha de inicio"
                onFocus={() => {
                  setSelectingStart(true);
                  setSelectingEnd(false);
                }}
                onChange={(e) => {
                  const localTextFrom = e.target.value;
                  setLocalTextFrom(localTextFrom);
                  const date = dayjs(localTextFrom);

                  if (date.isValid()) {
                    if (dayjs(date).isAfter(dayjs(localDate?.to))) {
                      setLocalDate({
                        from: date.startOf('day').toDate(),
                        to: undefined,
                      });
                      setLocalTextTo('');

                      setSelectingStart(false);
                      setSelectingEnd(true);
                    } else {
                      setLocalDate({
                        from: date.startOf('day').toDate(),
                        to: localDate?.to,
                      });

                      setSelectingStart(false);
                      setSelectingEnd(false);
                    }
                  } else {
                    setLocalDate({
                      from: undefined,
                      to: localDate?.to,
                    });
                  }
                }}
                className={cn(
                  'h-[38px] w-1/2 rounded-[9px] border border-border bg-background p-2 text-sm font-normal leading-[14px] outline-none transition-all placeholder:text-[#B3B8BC] focus:ring-0',
                  selectingStart && 'border-primary bg-transparent'
                )}
                value={localTextFrom}
              />
              <input
                type="text"
                placeholder="Fecha final"
                onFocus={() => {
                  setSelectingEnd(true);
                  setSelectingStart(false);
                }}
                onChange={(e) => {
                  const localTextTo = e.target.value;
                  setLocalTextTo(localTextTo);
                  const date = dayjs(localTextTo);

                  if (date.isValid()) {
                    if (dayjs(date).isBefore(dayjs(localDate?.from))) {
                      setLocalDate({
                        // from date must have 00:00:00 time of the day
                        from: date.startOf('day').toDate(),
                        to: undefined,
                      });
                      setLocalTextFrom(format(date.toDate(), 'LLL dd, y'));
                      setLocalTextTo('');

                      setSelectingStart(false);
                      setSelectingEnd(true);
                    } else {
                      setLocalDate({
                        from: localDate?.from,
                        to: date.endOf('day').toDate(),
                      });

                      setSelectingStart(false);
                      setSelectingEnd(false);
                    }
                  } else {
                    setLocalDate({
                      from: localDate?.from,
                      to: undefined,
                    });
                  }
                }}
                className={cn(
                  'h-[38px] w-1/2 rounded-[9px] border border-border bg-background p-2 text-sm font-normal leading-[14px] outline-none transition-all placeholder:text-[#B3B8BC] focus:ring-0',
                  selectingEnd && ' border-primary bg-transparent'
                )}
                value={localTextTo}
              />
            </div>
            <div className="px-6 gap-4 sm:gap-0 sm:border-t flex flex-col sm:flex-row sm:px-0">
              <div className="w-full sm:px-2 grid grid-cols-3 sm:py-4 sm:flex border rounded-lg sm:rounded-none sm:border-0 sm:border-r sm:flex-col sm:w-36">
                <Button
                  variant="ghost"
                  onClick={() => {
                    // set range to this week (including today)
                    setLocalDate({
                      from: dayjs().startOf('week').toDate(),
                      to: dayjs().endOf('week').toDate(),
                    });
                    setLocalTextFrom(
                      format(dayjs().startOf('week').toDate(), 'LLL dd, y')
                    );
                    setLocalTextTo(
                      format(dayjs().endOf('week').toDate(), 'LLL dd, y')
                    );
                    setDate?.({
                      from: dayjs().startOf('week').toDate(),
                      to: dayjs().endOf('week').toDate(),
                    });
                    setOpen(false);
                  }}
                  className="w-full font-normal whitespace-nowrap sm:justify-between"
                >
                  <span className="sm:hidden">
                    {dictionary[lang].daterange.timeframes['this-week']}
                  </span>
                  <span className="hidden sm:inline-block">
                    {dictionary[lang].daterange.timeframes['this-week']}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    // set range to this month (including today)
                    setLocalDate({
                      from: dayjs().startOf('month').toDate(),
                      to: dayjs().endOf('month').toDate(),
                    });
                    setLocalTextFrom(
                      format(dayjs().startOf('month').toDate(), 'LLL dd, y')
                    );
                    setLocalTextTo(
                      format(dayjs().endOf('month').toDate(), 'LLL dd, y')
                    );
                    setDate?.({
                      from: dayjs().startOf('month').toDate(),
                      to: dayjs().endOf('month').toDate(),
                    });
                    setOpen(false);
                  }}
                  className="w-full font-normal whitespace-nowrap sm:justify-between"
                >
                  <span className="sm:hidden">
                    {dictionary[lang].daterange.timeframes['this-month']}
                  </span>
                  <span className="hidden sm:inline-block">
                    {dictionary[lang].daterange.timeframes['this-month']}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    // set range to last 7 days (including today)
                    setLocalDate({
                      from: dayjs().subtract(6, 'day').startOf('day').toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setLocalTextFrom(
                      format(
                        dayjs().subtract(6, 'day').startOf('day').toDate(),
                        'LLL dd, y'
                      )
                    );
                    setLocalTextTo(
                      format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                    );
                    setDate?.({
                      from: dayjs().subtract(6, 'day').startOf('day').toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setOpen(false);
                  }}
                  className="w-full font-normal whitespace-nowrap sm:justify-between"
                >
                  <span className="sm:hidden">7d</span>
                  <span className="hidden sm:inline-block">
                    {dictionary[lang].daterange.timeframes['7d']}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    // set range to last 30 days (including today)
                    setLocalDate({
                      from: dayjs().subtract(29, 'day').startOf('day').toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setLocalTextFrom(
                      format(
                        dayjs().subtract(29, 'day').startOf('day').toDate(),
                        'LLL dd, y'
                      )
                    );
                    setLocalTextTo(
                      format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                    );
                    setDate?.({
                      from: dayjs().subtract(29, 'day').startOf('day').toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setOpen(false);
                  }}
                  className="w-full font-normal whitespace-nowrap sm:justify-between"
                >
                  <span className="sm:hidden">30d</span>
                  <span className="hidden sm:inline-block">
                    {dictionary[lang].daterange.timeframes['30d']}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    // set range to last 3 months (including today)
                    setLocalDate({
                      from: dayjs()
                        .subtract(3, 'month')
                        .startOf('day')
                        .toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setLocalTextFrom(
                      format(
                        dayjs().subtract(3, 'month').startOf('day').toDate(),
                        'LLL dd, y'
                      )
                    );
                    setLocalTextTo(
                      format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                    );
                    setDate?.({
                      from: dayjs()
                        .subtract(3, 'month')
                        .startOf('day')
                        .toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setOpen(false);
                  }}
                  className="w-full font-normal whitespace-nowrap sm:justify-between"
                >
                  <span className="sm:hidden">3M</span>
                  <span className="hidden sm:inline-block">
                    {dictionary[lang].daterange.timeframes['3M']}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    // set range to last 6 months (including today)
                    setLocalDate({
                      from: dayjs()
                        .subtract(6, 'month')
                        .startOf('day')
                        .toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setLocalTextFrom(
                      format(
                        dayjs().subtract(6, 'month').startOf('day').toDate(),
                        'LLL dd, y'
                      )
                    );
                    setLocalTextTo(
                      format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                    );
                    setDate?.({
                      from: dayjs()
                        .subtract(6, 'month')
                        .startOf('day')
                        .toDate(),
                      to: dayjs().endOf('day').toDate(),
                    });
                    setOpen(false);
                  }}
                  className="w-full font-normal whitespace-nowrap sm:justify-between"
                >
                  <span className="sm:hidden">6M</span>
                  <span className="hidden sm:inline-block">
                    {dictionary[lang].daterange.timeframes['6M']}
                  </span>
                </Button>
              </div>
              <div className="sm:p-4 space-y-4">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={localDate}
                  onDayClick={(dayClicked) => {
                    if (selectingStart) {
                      if (dayjs(dayClicked).isAfter(dayjs(localDate?.to))) {
                        setLocalDate({
                          from: dayjs(dayClicked).startOf('day').toDate(),
                          to: undefined,
                        });
                        setLocalTextFrom(format(dayClicked, 'LLL dd, y'));

                        setSelectingStart(false);
                        setSelectingEnd(true);
                      } else {
                        setLocalDate({
                          from: dayjs(dayClicked).startOf('day').toDate(),
                          to: localDate?.to,
                        });
                        setLocalTextFrom(format(dayClicked, 'LLL dd, y'));

                        setSelectingStart(false);
                        setSelectingEnd(false);
                      }
                    } else if (selectingEnd) {
                      if (dayjs(dayClicked).isBefore(dayjs(localDate?.from))) {
                        setLocalDate({
                          from: dayjs(dayClicked).startOf('day').toDate(),
                          to: undefined,
                        });
                        setLocalTextFrom(format(dayClicked, 'LLL dd, y'));
                        setLocalTextTo('');

                        setSelectingStart(false);
                        setSelectingEnd(true);
                      } else {
                        setLocalDate({
                          from: localDate?.from,
                          to: dayjs(dayClicked).endOf('day').toDate(),
                        });
                        setLocalTextTo(format(dayClicked, 'LLL dd, y'));

                        setSelectingStart(false);
                        setSelectingEnd(false);
                      }
                    } else if (
                      dayjs(dayClicked).isBefore(dayjs(localDate?.from))
                    ) {
                      setLocalDate({
                        from: dayjs(dayClicked).startOf('day').toDate(),
                        to: undefined,
                      });
                      setLocalTextFrom(format(dayClicked, 'LLL dd, y'));

                      setSelectingStart(false);
                      setSelectingEnd(true);
                    } else {
                      setLocalDate({
                        from: localDate?.from,
                        to: dayjs(dayClicked).endOf('day').toDate(),
                      });
                      setLocalTextTo(format(dayClicked, 'LLL dd, y'));

                      setSelectingStart(false);
                      setSelectingEnd(false);
                    }
                  }}
                  numberOfMonths={1}
                  className="w-fit !p-0 !m-0 mx-auto"
                />
                <div className="flex w-full justify-end gap-2 pb-3 pr-3 sm:p-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLocalDate(date);
                      setLocalTextFrom(
                        date?.from ? format(date.from, 'LLL dd, y') : ''
                      );
                      setLocalTextTo(
                        date?.to ? format(date.to, 'LLL dd, y') : ''
                      );
                      setOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setDate?.(localDate);
                      setOpen(false);
                    }}
                    disabled={
                      !localDate?.from ||
                      !localDate?.to ||
                      (localDate?.from &&
                        localDate?.to &&
                        dayjs(localDate?.from).isAfter(dayjs(localDate?.to)))
                    }
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setLocalDate(date);
        setLocalTextFrom(date?.from ? format(date.from, 'LLL dd, y') : '');
        setLocalTextTo(date?.to ? format(date.to, 'LLL dd, y') : '');
      }}
    >
      <DialogTrigger asChild>
        <Button
          id="date"
          variant="secondary"
          size="sm"
          className={cn(
            'justify-start text-left whitespace-nowrap',
            !date && 'text-[#B3B8BC]',
            active && 'border-secondary text-secondary',
            buttonClassName
          )}
          onClick={() => setOpen(!open)}
        >
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd')} - {format(date.to, 'LLL dd')}
                <button
                  className={cn('ml-auto', hideClearButton && 'hidden')}
                  onClick={() => setDate?.(undefined)}
                >
                  <XIcon
                    className={cn(
                      'h-4 w-4',
                      active ? 'text-secondary' : 'text-[#B3B8BC]'
                    )}
                  />
                </button>
              </>
            ) : (
              <>
                {format(date.from, 'LLL dd, y')}
                <button
                  className={cn('ml-auto', hideClearButton && 'hidden')}
                  onClick={() => setDate?.(undefined)}
                >
                  <XIcon
                    className={cn(
                      'h-4 w-4',
                      active ? 'text-secondary' : 'text-primary'
                    )}
                  />{' '}
                </button>
              </>
            )
          ) : (
            <span className={cn(active ? 'text-secondary' : 'text-[#B3B8BC]')}>
              Selecciona un rango de fechas
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#05060A] border">
        <div className="ml-auto mt-2 flex gap-2 px-6 py-4">
          <input
            type="text"
            placeholder="Fecha de inicio"
            onFocus={() => {
              setSelectingStart(true);
              setSelectingEnd(false);
            }}
            onChange={(e) => {
              const localTextFrom = e.target.value;
              setLocalTextFrom(localTextFrom);
              const date = dayjs(localTextFrom);

              if (date.isValid()) {
                if (dayjs(date).isAfter(dayjs(localDate?.to))) {
                  setLocalDate({
                    from: date.startOf('day').toDate(),
                    to: undefined,
                  });
                  setLocalTextTo('');

                  setSelectingStart(false);
                  setSelectingEnd(true);
                } else {
                  setLocalDate({
                    from: date.startOf('day').toDate(),
                    to: localDate?.to,
                  });

                  setSelectingStart(false);
                  setSelectingEnd(false);
                }
              } else {
                setLocalDate({
                  from: undefined,
                  to: localDate?.to,
                });
              }
            }}
            className={cn(
              'h-[38px] w-1/2 rounded-[9px] border border-border bg-background p-2 text-sm font-normal leading-[14px] outline-none transition-all placeholder:text-[#B3B8BC] focus:ring-0',
              selectingStart && 'border-primary bg-transparent'
            )}
            value={localTextFrom}
          />
          <input
            type="text"
            placeholder="Fecha final"
            onFocus={() => {
              setSelectingEnd(true);
              setSelectingStart(false);
            }}
            onChange={(e) => {
              const localTextTo = e.target.value;
              setLocalTextTo(localTextTo);
              const date = dayjs(localTextTo);

              if (date.isValid()) {
                if (dayjs(date).isBefore(dayjs(localDate?.from))) {
                  setLocalDate({
                    // from date must have 00:00:00 time of the day
                    from: date.startOf('day').toDate(),
                    to: undefined,
                  });
                  setLocalTextFrom(format(date.toDate(), 'LLL dd, y'));
                  setLocalTextTo('');

                  setSelectingStart(false);
                  setSelectingEnd(true);
                } else {
                  setLocalDate({
                    from: localDate?.from,
                    to: date.endOf('day').toDate(),
                  });

                  setSelectingStart(false);
                  setSelectingEnd(false);
                }
              } else {
                setLocalDate({
                  from: localDate?.from,
                  to: undefined,
                });
              }
            }}
            className={cn(
              'h-[38px] w-1/2 rounded-[9px] border border-border bg-background p-2 text-sm font-normal leading-[14px] outline-none transition-all placeholder:text-[#B3B8BC] focus:ring-0',
              selectingEnd && ' border-primary bg-transparent'
            )}
            value={localTextTo}
          />
        </div>
        <div className="px-6 gap-4 sm:gap-0 sm:border-t flex flex-col sm:flex-row sm:px-0">
          <div className="w-full sm:px-2 grid grid-cols-3 sm:py-4 sm:flex border rounded-lg sm:rounded-none sm:border-0 sm:border-r sm:flex-col sm:w-36">
            <Button
              variant="ghost"
              onClick={() => {
                // set range to this week (including today)
                setLocalDate({
                  from: dayjs().startOf('week').toDate(),
                  to: dayjs().endOf('week').toDate(),
                });
                setLocalTextFrom(
                  format(dayjs().startOf('week').toDate(), 'LLL dd, y')
                );
                setLocalTextTo(
                  format(dayjs().endOf('week').toDate(), 'LLL dd, y')
                );
                setDate?.({
                  from: dayjs().startOf('week').toDate(),
                  to: dayjs().endOf('week').toDate(),
                });
                setOpen(false);
              }}
              className="w-full font-normal whitespace-nowrap sm:justify-between"
            >
              <span className="sm:hidden">
                {dictionary[lang].daterange.timeframes['this-week']}
              </span>
              <span className="hidden sm:inline-block">
                {dictionary[lang].daterange.timeframes['this-week']}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // set range to this month (including today)
                setLocalDate({
                  from: dayjs().startOf('month').toDate(),
                  to: dayjs().endOf('month').toDate(),
                });
                setLocalTextFrom(
                  format(dayjs().startOf('month').toDate(), 'LLL dd, y')
                );
                setLocalTextTo(
                  format(dayjs().endOf('month').toDate(), 'LLL dd, y')
                );
                setDate?.({
                  from: dayjs().startOf('month').toDate(),
                  to: dayjs().endOf('month').toDate(),
                });
                setOpen(false);
              }}
              className="w-full font-normal whitespace-nowrap sm:justify-between"
            >
              <span className="sm:hidden">
                {dictionary[lang].daterange.timeframes['this-month']}
              </span>
              <span className="hidden sm:inline-block">
                {dictionary[lang].daterange.timeframes['this-month']}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // set range to last 7 days (including today)
                setLocalDate({
                  from: dayjs().subtract(6, 'day').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setLocalTextFrom(
                  format(
                    dayjs().subtract(6, 'day').startOf('day').toDate(),
                    'LLL dd, y'
                  )
                );
                setLocalTextTo(
                  format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                );
                setDate?.({
                  from: dayjs().subtract(6, 'day').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setOpen(false);
              }}
              className="w-full font-normal whitespace-nowrap sm:justify-between"
            >
              <span className="sm:hidden">7d</span>
              <span className="hidden sm:inline-block">
                {dictionary[lang].daterange.timeframes['7d']}
              </span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                // set range to last 30 days (including today)
                setLocalDate({
                  from: dayjs().subtract(29, 'day').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setLocalTextFrom(
                  format(
                    dayjs().subtract(29, 'day').startOf('day').toDate(),
                    'LLL dd, y'
                  )
                );
                setLocalTextTo(
                  format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                );
                setDate?.({
                  from: dayjs().subtract(29, 'day').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setOpen(false);
              }}
              className="w-full font-normal whitespace-nowrap sm:justify-between"
            >
              <span className="sm:hidden">30d</span>
              <span className="hidden sm:inline-block">
                {dictionary[lang].daterange.timeframes['30d']}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // set range to last 3 months (including today)
                setLocalDate({
                  from: dayjs().subtract(3, 'month').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setLocalTextFrom(
                  format(
                    dayjs().subtract(3, 'month').startOf('day').toDate(),
                    'LLL dd, y'
                  )
                );
                setLocalTextTo(
                  format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                );
                setDate?.({
                  from: dayjs().subtract(3, 'month').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setOpen(false);
              }}
              className="w-full font-normal whitespace-nowrap sm:justify-between"
            >
              <span className="sm:hidden">3M</span>
              <span className="hidden sm:inline-block">
                {dictionary[lang].daterange.timeframes['3M']}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // set range to last 6 months (including today)
                setLocalDate({
                  from: dayjs().subtract(6, 'month').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setLocalTextFrom(
                  format(
                    dayjs().subtract(6, 'month').startOf('day').toDate(),
                    'LLL dd, y'
                  )
                );
                setLocalTextTo(
                  format(dayjs().endOf('day').toDate(), 'LLL dd, y')
                );
                setDate?.({
                  from: dayjs().subtract(6, 'month').startOf('day').toDate(),
                  to: dayjs().endOf('day').toDate(),
                });
                setOpen(false);
              }}
              className="w-full font-normal whitespace-nowrap sm:justify-between"
            >
              <span className="sm:hidden">6M</span>
              <span className="hidden sm:inline-block">
                {dictionary[lang].daterange.timeframes['6M']}
              </span>
            </Button>
          </div>
          <div className="sm:p-4 space-y-4">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={localDate}
              onDayClick={(dayClicked) => {
                if (selectingStart) {
                  if (dayjs(dayClicked).isAfter(dayjs(localDate?.to))) {
                    setLocalDate({
                      from: dayjs(dayClicked).startOf('day').toDate(),
                      to: undefined,
                    });
                    setLocalTextFrom(format(dayClicked, 'LLL dd, y'));

                    setSelectingStart(false);
                    setSelectingEnd(true);
                  } else {
                    setLocalDate({
                      from: dayjs(dayClicked).startOf('day').toDate(),
                      to: localDate?.to,
                    });
                    setLocalTextFrom(format(dayClicked, 'LLL dd, y'));

                    setSelectingStart(false);
                    setSelectingEnd(false);
                  }
                } else if (selectingEnd) {
                  if (dayjs(dayClicked).isBefore(dayjs(localDate?.from))) {
                    setLocalDate({
                      from: dayjs(dayClicked).startOf('day').toDate(),
                      to: undefined,
                    });
                    setLocalTextFrom(format(dayClicked, 'LLL dd, y'));
                    setLocalTextTo('');

                    setSelectingStart(false);
                    setSelectingEnd(true);
                  } else {
                    setLocalDate({
                      from: localDate?.from,
                      to: dayjs(dayClicked).endOf('day').toDate(),
                    });
                    setLocalTextTo(format(dayClicked, 'LLL dd, y'));

                    setSelectingStart(false);
                    setSelectingEnd(false);
                  }
                } else if (dayjs(dayClicked).isBefore(dayjs(localDate?.from))) {
                  setLocalDate({
                    from: dayjs(dayClicked).startOf('day').toDate(),
                    to: undefined,
                  });
                  setLocalTextFrom(format(dayClicked, 'LLL dd, y'));

                  setSelectingStart(false);
                  setSelectingEnd(true);
                } else {
                  setLocalDate({
                    from: localDate?.from,
                    to: dayjs(dayClicked).endOf('day').toDate(),
                  });
                  setLocalTextTo(format(dayClicked, 'LLL dd, y'));

                  setSelectingStart(false);
                  setSelectingEnd(false);
                }
              }}
              numberOfMonths={1}
              className="w-fit !p-0 !mx-auto"
            />
            <div className="flex w-full justify-end gap-2 pb-3 pr-3 sm:p-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setLocalDate(date);
                  setLocalTextFrom(
                    date?.from ? format(date.from, 'LLL dd, y') : ''
                  );
                  setLocalTextTo(date?.to ? format(date.to, 'LLL dd, y') : '');
                  setOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setDate?.(localDate);
                  setOpen(false);
                }}
                disabled={
                  !localDate?.from ||
                  !localDate?.to ||
                  (localDate?.from &&
                    localDate?.to &&
                    dayjs(localDate?.from).isAfter(dayjs(localDate?.to)))
                }
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

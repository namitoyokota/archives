import {
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  addDays,
  subDays,
  addYears,
  subYears,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { IDatePickerMonthItem, IDatePickerRangeOption } from './vm-date-picker.interfaces';

const allDueYearsSince = 5;
const pickerStartYears = 2017;
const pickerEndYears = 2027;

export function getDaysSince(daysSince, isFutureType = false): Date {
  if (isFutureType) {
    return addDays(new Date(), daysSince);
  } else {
    return subDays(new Date(), daysSince);
  }
}

export function getYearsSince(yearsSince, isFutureType = false): Date {
  if (isFutureType) {
    return addYears(new Date(), yearsSince);
  } else {
    return subYears(new Date(), yearsSince);
  }
}

export function getShortDaysOfWeek(): Array<string> {
  const firstDOW = startOfWeek(new Date());
  const shortDaysOfWeek = [...Array(7)].map((_, i) => format(addDays(firstDOW, i), 'E'));

  return shortDaysOfWeek;
}

export function getShortMonth(month: Date): string {
  return format(month, 'LLL');
}

export function getMonths(): Array<IDatePickerMonthItem> {
  const months = [];

  for (let i = 0; i < 12; i++) {
    months.push(enUS.localize.month(i, { width: 'abbreviated' }));
  }

  return months.map((month, i) => {
    return {
      index: i,
      month: month,
    };
  });
}

export function getYears(): Array<number> {
  const years = [];

  for (let i = pickerStartYears; i <= pickerEndYears; i++) {
    years.push(i);
  }

  return years;
}

export function takeWeek(start = new Date()): () => Array<Date> {
  let date = startOfWeek(startOfDay(start));

  return function () {
    const week = [...Array(7)].map((_, i) => addDays(date, i));
    date = addDays(week[6], 1);
    return week;
  };
}

export function takeMonth(start = new Date()): (value?: Date, isPrevious?: boolean) => Array<Array<Date>> {
  let month: Array<Array<Date>> = [];
  let range: Array<Array<Date>> = [];

  let date = start;

  function firstDayOfRange(range): Date {
    return range[0][0];
  }

  function lastDayOfRange(range): Date {
    return range[range.length - 1][6];
  }

  return function (value?: Date, isPrevious?: boolean): Array<Array<Date>> {
    if (value) {
      date = value;
    } else if (isPrevious) {
      date = addDays(firstDayOfRange(range), -1);
    }

    const weekGen = takeWeek(startOfMonth(date));
    const endDate = startOfDay(endOfWeek(endOfMonth(date)));
    month.push(weekGen());

    while (lastDayOfRange(month) < endDate) {
      month.push(weekGen());
    }

    //-- Display a 6 week calendar month ****
    for (let i = month.length; i < 6; i++) {
      month.push(weekGen());
    }
    // **************************************

    range = month;
    month = [];
    date = addDays(lastDayOfRange(range), 1);

    return range;
  };
}

export const vmDatePickerRangeOptions = {
  allDue: (): IDatePickerRangeOption => {
    return {
      dateFrom: getYearsSince(allDueYearsSince),
      dateTo: new Date(),
      defaultText: 'All Due',
      label: 'All Due',
    };
  },
  today: (): IDatePickerRangeOption => {
    return {
      dateFrom: new Date(),
      label: 'Today',
    };
  },
  sinceYesterday: (): IDatePickerRangeOption => {
    return {
      dateFrom: getDaysSince(1),
      dateTo: new Date(),
      label: 'Since Yesterday',
    };
  },
  last7Days: (): IDatePickerRangeOption => {
    return {
      dateFrom: getDaysSince(7),
      dateTo: new Date(),
      label: 'Last 7 Days',
    };
  },
  last30Days: (): IDatePickerRangeOption => {
    return {
      dateFrom: getDaysSince(30),
      dateTo: new Date(),
      label: 'Last 30 Days',
    };
  },
  last60Days: (): IDatePickerRangeOption => {
    return {
      dateFrom: getDaysSince(60),
      dateTo: new Date(),
      label: 'Last 60 Days',
    };
  },
  last90Days: (): IDatePickerRangeOption => {
    return {
      dateFrom: getDaysSince(90),
      dateTo: new Date(),
      label: 'Last 90 Days',
    };
  },
  last180Days: (): IDatePickerRangeOption => {
    return {
      dateFrom: getDaysSince(180),
      dateTo: new Date(),
      label: 'Last 180 Days',
    };
  },
  tomorrow: (): IDatePickerRangeOption => {
    return {
      dateTo: getDaysSince(1, true),
      dateFrom: new Date(),
      label: 'Tomorrow',
    };
  },
  next7Days: (): IDatePickerRangeOption => {
    return {
      dateTo: getDaysSince(7, true),
      dateFrom: new Date(),
      label: 'Next 7 Days',
    };
  },
  next30Days: (): IDatePickerRangeOption => {
    return {
      dateTo: getDaysSince(30, true),
      dateFrom: new Date(),
      label: 'Next 30 Days',
    };
  },
  next60Days: (): IDatePickerRangeOption => {
    return {
      dateTo: getDaysSince(60, true),
      dateFrom: new Date(),
      label: 'Next 60 Days',
    };
  },
  next90Days: (): IDatePickerRangeOption => {
    return {
      dateTo: getDaysSince(90, true),
      dateFrom: new Date(),
      label: 'Next 90 Days',
    };
  },
  next180Days: (): IDatePickerRangeOption => {
    return {
      dateTo: getDaysSince(180, true),
      dateFrom: new Date(),
      label: 'Next 180 Days',
    };
  },
  thisWeek: (): IDatePickerRangeOption => {
    return {
      dateFrom: startOfWeek(new Date()),
      dateTo: endOfWeek(new Date()),
      label: 'This Week',
    };
  },
  thisMonth: (): IDatePickerRangeOption => {
    return {
      dateFrom: startOfMonth(new Date()),
      dateTo: endOfMonth(new Date()),
      label: 'This Month',
    };
  },
};

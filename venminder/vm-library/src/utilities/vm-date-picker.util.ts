import {
    addDays,
    addMonths,
    addYears,
    endOfMonth,
    endOfWeek,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subYears,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { VMDatePickerMonthItem } from '../interfaces/vm-date-picker-month-item';
import type { VMDatePickerRangeOption } from '../interfaces/vm-date-picker-range-option';

const allDueYearsSince = 5;
const pickerStartYears = 2017;
const pickerEndYears = 2027;

const getNewDateWithoutTime = (): Date => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    return date;
};

export function getDaysSince(daysSince, isFutureType = false): Date {
    if (isFutureType) {
        return addDays(getNewDateWithoutTime(), daysSince);
    } else {
        return subDays(getNewDateWithoutTime(), daysSince);
    }
}

export function getMonthsSince(monthsSince, isFutureType = false): Date {
    if (isFutureType) {
        return addMonths(getNewDateWithoutTime(), monthsSince);
    } else {
        return subMonths(getNewDateWithoutTime(), monthsSince);
    }
}

export function getYearsSince(yearsSince, isFutureType = false): Date {
    if (isFutureType) {
        return addYears(getNewDateWithoutTime(), yearsSince);
    } else {
        return subYears(getNewDateWithoutTime(), yearsSince);
    }
}

export function getShortDaysOfWeek(): Array<string> {
    const firstDOW = startOfWeek(getNewDateWithoutTime());
    const shortDaysOfWeek = [...Array(7)].map((_, i) => format(addDays(firstDOW, i), 'E'));

    return shortDaysOfWeek;
}

export function getShortMonth(month: Date): string {
    return format(month, 'LLL');
}

export function getMonths(): Array<VMDatePickerMonthItem> {
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

export function takeWeek(start = getNewDateWithoutTime()): () => Array<Date> {
    let date = startOfWeek(startOfDay(start));

    return function () {
        const week = [...Array(7)].map((_, i) => addDays(date, i));
        date = addDays(week[6], 1);

        return week;
    };
}

export function takeMonth(start = getNewDateWithoutTime()): (value?: Date, isPrevious?: boolean) => Array<Array<Date>> {
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
    allDue: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getYearsSince(allDueYearsSince),
            dateTo: getNewDateWithoutTime(),
            defaultText: 'All Due',
            label: 'All Due',
        };
    },
    today: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getNewDateWithoutTime(),
            label: 'Today',
        };
    },
    sinceYesterday: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getDaysSince(1),
            dateTo: getNewDateWithoutTime(),
            label: 'Since Yesterday',
        };
    },
    last7Days: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getDaysSince(7),
            dateTo: getNewDateWithoutTime(),
            label: 'Last 7 Days',
        };
    },
    last30Days: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getDaysSince(30),
            dateTo: getNewDateWithoutTime(),
            label: 'Last 30 Days',
        };
    },
    last60Days: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getDaysSince(60),
            dateTo: getNewDateWithoutTime(),
            label: 'Last 60 Days',
        };
    },
    last90Days: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getDaysSince(90),
            dateTo: getNewDateWithoutTime(),
            label: 'Last 90 Days',
        };
    },
    last180Days: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getDaysSince(180),
            dateTo: getNewDateWithoutTime(),
            label: 'Last 180 Days',
        };
    },
    last6Months: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getMonthsSince(6),
            dateTo: getNewDateWithoutTime(),
            label: 'Last 6 Months',
        };
    },
    last1Year: (): VMDatePickerRangeOption => {
        return {
            dateFrom: getYearsSince(1),
            dateTo: getNewDateWithoutTime(),
            label: 'Last 1 Year',
        };
    },
    tomorrow: (): VMDatePickerRangeOption => {
        return {
            dateTo: getDaysSince(1, true),
            dateFrom: getNewDateWithoutTime(),
            label: 'Tomorrow',
        };
    },
    next7Days: (): VMDatePickerRangeOption => {
        return {
            dateTo: getDaysSince(7, true),
            dateFrom: getNewDateWithoutTime(),
            label: 'Next 7 Days',
        };
    },
    next30Days: (): VMDatePickerRangeOption => {
        return {
            dateTo: getDaysSince(30, true),
            dateFrom: getNewDateWithoutTime(),
            label: 'Next 30 Days',
        };
    },
    next60Days: (): VMDatePickerRangeOption => {
        return {
            dateTo: getDaysSince(60, true),
            dateFrom: getNewDateWithoutTime(),
            label: 'Next 60 Days',
        };
    },
    next90Days: (): VMDatePickerRangeOption => {
        return {
            dateTo: getDaysSince(90, true),
            dateFrom: getNewDateWithoutTime(),
            label: 'Next 90 Days',
        };
    },
    next180Days: (): VMDatePickerRangeOption => {
        return {
            dateTo: getDaysSince(180, true),
            dateFrom: getNewDateWithoutTime(),
            label: 'Next 180 Days',
        };
    },
    thisWeek: (): VMDatePickerRangeOption => {
        return {
            dateFrom: startOfWeek(getNewDateWithoutTime()),
            dateTo: endOfWeek(getNewDateWithoutTime()),
            label: 'This Week',
        };
    },
    thisMonth: (): VMDatePickerRangeOption => {
        return {
            dateFrom: startOfMonth(getNewDateWithoutTime()),
            dateTo: endOfMonth(getNewDateWithoutTime()),
            label: 'This Month',
        };
    },
};

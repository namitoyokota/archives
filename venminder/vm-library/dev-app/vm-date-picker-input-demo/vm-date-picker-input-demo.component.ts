import type { VMDatePickerSelectedArgs } from 'resources';
import { VMDatePickerDisplayType, vmDatePickerRangeOptions } from 'resources';

export class VMDatePickerInputDemoComponent {
    readonly vmDatePickerDisplayTypes: typeof VMDatePickerDisplayType = VMDatePickerDisplayType;

    dateRangeOptions = [
        vmDatePickerRangeOptions.last30Days,
        vmDatePickerRangeOptions.last90Days,
        vmDatePickerRangeOptions.last6Months,
        vmDatePickerRangeOptions.last1Year,
    ];

    picker1Args = {
        dateFrom: new Date(2023, 0, 18),
    };

    picker4Args = {
        dateFrom: new Date(2023, 0, 15),
        dateTo: new Date(2023, 2, 25),
    };

    onDateSelected = (dateArg: Date | VMDatePickerSelectedArgs): void => {
        console.log(dateArg);
    };
}

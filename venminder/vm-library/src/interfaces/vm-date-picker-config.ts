import type { VMDatePickerDisplayType } from '../enums/vm-date-picker-display-type.enum';
import type { VMDatePickerRangeOption } from './vm-date-picker-range-option';

export interface VMDatePickerConfig {
    allowDateRange?: boolean;
    columnName?: string;
    dateRangeColumnHeader?: string;
    displayType?: VMDatePickerDisplayType;
    dateRangeOptions?: Array<() => VMDatePickerRangeOption>;
    showColumnName?: boolean;
}

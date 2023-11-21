import { VmDatePickerDisplayType } from './vm-date-picker.enums';

interface IDatePickerRangeOption {
  label?: string;
  dateFrom: Date;
  dateTo?: Date;
  defaultText?: string;
}

interface IDatePickerConfig {
  allowDateRange?: boolean;
  columnName?: string;
  displayType?: VmDatePickerDisplayType;
  dateRangeOptions?: Array<() => IDatePickerRangeOption>;
  showColumnName?: boolean;
}

interface IDatePickerMonthItem {
  index: number;
  month: string;
}

export { IDatePickerConfig, IDatePickerMonthItem, IDatePickerRangeOption };

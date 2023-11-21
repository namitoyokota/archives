import { addMonths, format, isSameDay, isSameMonth } from 'date-fns';
import type { MenuState } from '@venminder/vm-library';
import { VmDatePickerCSSDefinitions, VmDatePickerDisplayType } from './vm-date-picker.enums';
import { IDatePickerRangeOption } from './vm-date-picker.interfaces';
import { getMonths, getShortDaysOfWeek, getShortMonth, getYears, takeMonth } from './vm-date-picker.utils';
import { VMButtonTypes } from '@venminder/vm-library';

export class VmDatePicker {
  rangeOptions: Array<() => IDatePickerRangeOption>;
  showDateView: number;

  private displayType: VmDatePickerDisplayType;
  private menuState: MenuState;
  private allowDateRange = false;
  private showPredefined: number;
  private monGen = takeMonth();

  weeks: Array<Array<Date>> = [];
  date = new Date();
  daysOfWeek = getShortDaysOfWeek();
  month = getShortMonth(this.date);
  year = this.date.getFullYear();

  months = getMonths();
  years = getYears();

  private monthPopupActive = false;
  private yearPopupActive = false;
  private fromDate: Date = null;
  private toDate: Date = null;
  private datePickerOptions = null;

  readonly vmButtonTypes: typeof VMButtonTypes = VMButtonTypes;
  readonly vmDatePickerDisplayTypes: typeof VmDatePickerDisplayType = VmDatePickerDisplayType;

  activate(model: MenuState): void {
    this.menuState = model;

    this.displayType =
      this.menuState.data.displayType !== undefined ? this.menuState.data.displayType : VmDatePickerDisplayType.DateViewOnly;

    this.rangeOptions = this.menuState.data.dateRangeOptions;

    this.allowDateRange = this.menuState.data.allowDateRange;
    this.showDateView = this.displayType & (VmDatePickerDisplayType.DateViewOnly | VmDatePickerDisplayType.Full);
    this.showPredefined = this.displayType & (VmDatePickerDisplayType.PredefinedRangesOnly | VmDatePickerDisplayType.Full);

    this.datePickerOptions = this.menuState.data.datePickerOptions;

    this.resetDates();
  }

  attached(): void {
    this.menuState.render();
  }

  apply(): void {
    const dateOptions = (): IDatePickerRangeOption => {
      return {
        dateFrom: this.fromDate,
        dateTo: this.toDate,
      };
    };

    this.menuState.methods.onDateSelected(dateOptions);
  }

  deactivateMonthYearPopups(): void {
    this.monthPopupActive = false;
    this.yearPopupActive = false;
  }

  toggleMonthPopup(event: Event): void {
    event.stopPropagation();
    this.monthPopupActive = !this.monthPopupActive;
    this.yearPopupActive = false;
  }

  toggleYearPopup(event: Event): void {
    event.stopPropagation();
    this.yearPopupActive = !this.yearPopupActive;
    this.monthPopupActive = false;
  }

  dayColor(day: Date): string {
    const classes = [];
    let isSelected = false;

    if (this.datePickerOptions || this.fromDate) {
      if (isSameDay(day, this.fromDate)) {
        classes.push(VmDatePickerCSSDefinitions.Selected);

        if (this.toDate) {
          classes.push(VmDatePickerCSSDefinitions.Start);
        }

        isSelected = true;
      } else {
        if (this.toDate && day > this.fromDate && day <= this.toDate) {
          classes.push(VmDatePickerCSSDefinitions.Selected);
          isSelected = true;

          if (!isSameDay(day, this.toDate)) {
            classes.push(VmDatePickerCSSDefinitions.Lighter);
          } else {
            classes.push(VmDatePickerCSSDefinitions.End);
          }
        }
      }
    }

    if (!isSelected) {
      if (!isSameMonth(day, this.date)) {
        classes.push(VmDatePickerCSSDefinitions.DayNotInMonth);
      } else if (isSameDay(day, new Date())) {
        classes.push(VmDatePickerCSSDefinitions.Today);
      }
    }

    return classes.join(' ');
  }

  formatDay(day: Date): string {
    return format(day, 'd');
  }

  getRangeOptionLabel(option: () => IDatePickerRangeOption): string {
    return option().label;
  }

  nextMonth(): void {
    this.weeks = this.monGen();
    this.date = addMonths(this.date, 1);
    this.setMonthYear();
  }

  previousMonth(): void {
    this.date = addMonths(this.date, -1);
    this.weeks = this.monGen(null, true);
    this.setMonthYear();
  }

  resetDates(): void {
    if (this.datePickerOptions) {
      this.fromDate = this.datePickerOptions.dateFrom;
      this.date = new Date(this.fromDate);
      this.toDate = this.datePickerOptions.dateTo;
    } else {
      this.date = new Date();
      this.toDate = null;
    }

    this.weeks = this.monGen(this.date);
    this.setMonthYear();
  }

  selectDateRangeOption(option: () => IDatePickerRangeOption, date?: Date): void {
    let dateOptions = option;

    if (date) {
      dateOptions = (): IDatePickerRangeOption => {
        return { dateFrom: date };
      };

      if (this.showPredefined || this.allowDateRange) {
        if (!this.fromDate) {
          this.fromDate = date;
        } else {
          if (date > this.fromDate && !this.toDate) {
            this.toDate = date;
          } else {
            this.toDate = null;
            this.fromDate = date;
          }
        }

        this.date = new Date(this.fromDate);
        this.weeks = this.monGen(this.date);
        this.setMonthYear();

        return;
      }
    }

    this.menuState.methods.onDateSelected(dateOptions);
  }

  selectMonth(month: number): void {
    this.date.setMonth(month);
    this.weeks = this.monGen(this.date);
    this.setMonthYear();
  }

  selectYear(year: number): void {
    this.date.setFullYear(year);
    this.weeks = this.monGen(this.date);
    this.setMonthYear();
  }

  setMonthYear(): void {
    this.month = getShortMonth(this.date);
    this.year = this.date.getFullYear();
  }
}

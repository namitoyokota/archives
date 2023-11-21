import { computedFrom, customElement } from 'aurelia-framework';
import { addMonths, format, isSameDay, isSameMonth } from 'date-fns';
import type { VMContextMenu } from '../../../classes/vm-context-menu';
import { VMButtonTypes } from '../../../enums/vm-button-types.enum';
import { VMDatePickerCSSDefinitions } from '../../../enums/vm-date-picker-css-definitions.enum';
import { VMDatePickerDisplayType } from '../../../enums/vm-date-picker-display-type.enum';
import type { VMDatePickerRangeOption } from '../../../interfaces/vm-date-picker-range-option';
import { getMonths, getShortDaysOfWeek, getShortMonth, getYears, takeMonth } from '../../../utilities/vm-date-picker.util';

@customElement('vm-date-picker-view')
export class VMDatePickerViewComponent {
    readonly vmButtonTypes: typeof VMButtonTypes = VMButtonTypes;
    readonly vmDatePickerDisplayTypes: typeof VMDatePickerDisplayType = VMDatePickerDisplayType;

    allowDateRange = false;
    datePickerRangeTitle = '';
    displayType: VMDatePickerDisplayType;
    monthPopupActive = false;
    rangeOptions: Array<() => VMDatePickerRangeOption>;
    showDateView: number;
    showPredefined: number;
    yearPopupActive = false;

    date = new Date();
    daysOfWeek = getShortDaysOfWeek();
    month = getShortMonth(this.date);
    months = getMonths();
    year = this.date.getFullYear();
    years = getYears();
    weeks: Array<Array<Date>> = [];

    private datePickerOptions = null;
    private fromDate: Date = null;
    private menuState: VMContextMenu;
    private monGen = takeMonth();
    private toDate: Date = null;

    @computedFrom('displayType')
    get getDateRangeOptionClasses(): string {
        const classes = [VMDatePickerCSSDefinitions.RangeOptionsContainer];

        if (this.displayType === VMDatePickerDisplayType.Full) {
            classes.push(VMDatePickerCSSDefinitions.FullView);
        }

        return classes.join(' ');
    }

    @computedFrom('displayType')
    get getDayViewClasses(): string {
        const classes = [VMDatePickerCSSDefinitions.CalendarViewContainer];

        if (this.displayType === VMDatePickerDisplayType.Full) {
            classes.push(VMDatePickerCSSDefinitions.BorderRight);
        }

        return classes.join(' ');
    }

    activate(model: VMContextMenu): void {
        this.menuState = model;

        this.displayType =
            this.menuState.data.displayType !== undefined ? this.menuState.data.displayType : VMDatePickerDisplayType.DateViewOnly;

        this.rangeOptions = this.menuState.data.dateRangeOptions;

        this.allowDateRange = this.menuState.data.allowDateRange;
        this.showDateView = this.displayType & (VMDatePickerDisplayType.DateViewOnly | VMDatePickerDisplayType.Full);
        this.showPredefined = this.displayType & (VMDatePickerDisplayType.PredefinedRangesOnly | VMDatePickerDisplayType.Full);

        this.datePickerOptions = this.menuState.data.datePickerOptions;
        this.datePickerRangeTitle = this.menuState.data.datePickerRangeTitle;

        this.resetDates();
    }

    attached(): void {
        if (this.menuState) {
            this.menuState.render();
        }
    }

    apply(): void {
        const dateOptions = (): VMDatePickerRangeOption => {
            return {
                dateFrom: this.fromDate,
                dateTo: this.toDate,
            };
        };

        this.menuState.methods.onDateSelected(dateOptions);
    }

    dayColor(day: Date): string {
        const classes = [];
        let isSelected = false;

        if (this.datePickerOptions || this.fromDate) {
            if (isSameDay(day, this.fromDate)) {
                classes.push(VMDatePickerCSSDefinitions.Selected);

                if (this.toDate) {
                    classes.push(VMDatePickerCSSDefinitions.Start);
                }

                isSelected = true;
            } else {
                if (this.toDate && day > this.fromDate && day <= this.toDate) {
                    classes.push(VMDatePickerCSSDefinitions.Selected);
                    isSelected = true;

                    if (!isSameDay(day, this.toDate)) {
                        classes.push(VMDatePickerCSSDefinitions.Lighter);
                    } else {
                        classes.push(VMDatePickerCSSDefinitions.End);
                    }
                }
            }
        }

        if (!isSelected) {
            if (!isSameMonth(day, this.date)) {
                classes.push(VMDatePickerCSSDefinitions.DayNotInMonth);
            } else if (isSameDay(day, new Date())) {
                classes.push(VMDatePickerCSSDefinitions.Today);
            }
        }

        return classes.join(' ');
    }

    deactivateMonthYearPopups(): void {
        this.monthPopupActive = false;
        this.yearPopupActive = false;
    }

    formatDay(day: Date): string {
        return format(day, 'd');
    }

    getRangeOptionLabel(option: () => VMDatePickerRangeOption): string {
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

    /**
     * @param option We're selecting a range from the predefined list of options
     * @param date We're selecting dates from the day view
     * @returns void
     */
    selectDateRangeOption(option: () => VMDatePickerRangeOption, date?: Date): void {
        let dateOptions = option;

        if (date) {
            dateOptions = (): VMDatePickerRangeOption => {
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
}

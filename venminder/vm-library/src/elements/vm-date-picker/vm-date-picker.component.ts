import { bindable, computedFrom, customElement, inject, PLATFORM } from 'aurelia-framework';
import { format } from 'date-fns';
import { VMDatePickerCSSDefinitions } from '../../enums/vm-date-picker-css-definitions.enum';
import { VMDatePickerDateFormats } from '../../enums/vm-date-picker-date-formats.enum';
import { VMDatePickerDisplayType } from '../../enums/vm-date-picker-display-type.enum';
import type { VMDatePickerRangeOption } from '../../interfaces/vm-date-picker-range-option';
import type { VMDatePickerSelectedArgs } from '../../interfaces/vm-date-picker-selected-args';
import { VMContextMenuService } from '../../services/vm-context-menu.service';

@customElement('vm-date-picker')
export class VMDatePickerComponent {
    @bindable allowDateRange = false;
    @bindable dateFrom: Date = null;
    @bindable dateTo: Date = null;
    @bindable datePickerRangeTitle = null;
    @bindable dateRangeOptions: Array<() => VMDatePickerRangeOption> = [];
    @bindable displayType: VMDatePickerDisplayType = VMDatePickerDisplayType.DateViewOnly;
    @bindable isDisabled = false;
    @bindable minDate: Date = null;
    @bindable maxDate: Date = null;
    @bindable onDateSelected: (dateArg: Date | VMDatePickerSelectedArgs) => void = null;

    dateRangeClass = '';

    placeHolderText = 'mm/dd/yyyy';

    private datePickerOptions = null;
    private offsetHeight = 3;

    @computedFrom('dateFrom', 'dateTo')
    get getDisplayText(): string {
        const dateParts = [];

        if (this.dateFrom) {
            dateParts.push(format(this.dateFrom, VMDatePickerDateFormats.DateFnsSlash));
        }

        if (this.dateTo) {
            dateParts.push(format(this.dateTo, VMDatePickerDateFormats.DateFnsSlash));
        }

        return dateParts.join(' - ');
    }

    constructor(@inject(VMContextMenuService) private contextMenuService: VMContextMenuService) {}

    attached(): void {
        if (this.allowDateRange || this.displayType !== VMDatePickerDisplayType.DateViewOnly) {
            this.dateRangeClass = VMDatePickerCSSDefinitions.DateRangeStyle;
            this.placeHolderText = 'mm/dd/yyyy - mm/dd/yyyy';
        }
    }

    clearDates(): void {
        this.dateFrom = null;
        this.dateTo = null;
        this.datePickerOptions = null;
    }

    openDatePicker(event): void {
        let el: HTMLElement = event.target;
        el = el.closest('.vm-date-picker');

        if (this.dateFrom) {
            this.datePickerOptions = {
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
            };
        }

        this.contextMenuService.open({
            component: PLATFORM.moduleName('../vm-date-picker/vm-date-picker-view/vm-date-picker-view.component', 'vm-library'),
            x: el.offsetLeft,
            y: el.offsetTop + el.offsetHeight + this.offsetHeight - window.scrollY,
            data: {
                datePickerRangeTitle: this.datePickerRangeTitle,
                datePickerOptions: this.datePickerOptions,
                displayType: this.displayType,
                allowDateRange: this.allowDateRange,
                dateRangeOptions: this.dateRangeOptions,
            },
            methods: {
                onDateSelected: (options) => {
                    this.datePickerOptions = options ? options() : null;

                    this.dateFrom = this.datePickerOptions?.dateFrom;
                    this.dateTo = this.datePickerOptions?.dateTo;

                    if (this.onDateSelected) {
                        let dateArg: Date | VMDatePickerSelectedArgs;

                        if (this.dateFrom || this.dateTo) {
                            dateArg = !this.dateTo
                                ? this.dateFrom
                                : <VMDatePickerSelectedArgs>{
                                      dateFrom: this.dateFrom,
                                      dateTo: this.dateTo,
                                  };
                        }

                        this.onDateSelected(dateArg);
                    }

                    this.contextMenuService.close();
                },
            },
        });
    }
}

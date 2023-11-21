import { bindable, inject, PLATFORM, computedFrom } from 'aurelia-framework';
import { format } from 'date-fns';
import { VMContextMenuService } from '@venminder/vm-library';
import { VmDatePickerDateFormats, VmDatePickerDisplayType } from '../vm-date-picker.enums';
import { IDatePickerRangeOption } from '../vm-date-picker.interfaces';

export class VmDatePickerInput {
  @bindable allowDateRange = false;
  @bindable dateRangeOptions: Array<() => IDatePickerRangeOption> = [];
  @bindable displayType: VmDatePickerDisplayType = VmDatePickerDisplayType.DateViewOnly;
  @bindable dateFrom: Date = null;
  @bindable dateTo: Date = null;

  displayDateText = '';
  dateRangeClass = '';

  placeHolderText = 'mm/dd/yyyy';

  private buttonHeightOffset = 44;
  private datePickerOptions = null;

  @computedFrom('dateFrom', 'dateTo')
  get getDisplayText(): string {
      const dateParts = [];

      if (this.dateFrom) {
          dateParts.push(format(this.dateFrom, VmDatePickerDateFormats.DateFnsSlash));
      }

      if (this.dateTo) {
          dateParts.push(format(this.dateTo, VmDatePickerDateFormats.DateFnsSlash));
      }

      this.displayDateText = dateParts.join(' - ');
      return this.displayDateText;
  }

  constructor(@inject(VMContextMenuService) protected contextMenu: VMContextMenuService) {}

  attached(): void {
    if (this.allowDateRange || this.displayType === VmDatePickerDisplayType.PredefinedRangesOnly) {
      this.dateRangeClass = 'date-range';
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
    el = el.closest('.vm-date-picker-input');

    const rect = el.getBoundingClientRect();
    const elX = event.clientX - rect.left;
    const elY = event.clientY - rect.top;

    if (this.dateFrom) {
      this.datePickerOptions = {
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
      };
    }

    this.contextMenu.open({
      y: event.clientY + (this.buttonHeightOffset - elY),
      x: event.clientX - elX,
      component: PLATFORM.moduleName('shared-from-dcdev/resources/features/vm-date-picker/vm-date-picker.component', 'global'),
      data: {
        datePickerOptions: this.datePickerOptions,
        displayType: this.displayType,
        allowDateRange: this.allowDateRange,
        dateRangeOptions: this.dateRangeOptions,
      },
      methods: {
        onDateSelected: (options) => {
          this.datePickerOptions = options();

          this.dateFrom = this.datePickerOptions.dateFrom;
          this.dateTo = this.datePickerOptions.dateTo;

          this.contextMenu.close();
        },
      },
    });
  }
}

import { PLATFORM } from 'aurelia-pal';

export class DatePickerView {
  constructor() {
    PLATFORM.moduleName('./views/date-picker-days.view');
    PLATFORM.moduleName('./views/date-picker-months.view');
    PLATFORM.moduleName('./views/date-picker-years.view');
  }
}

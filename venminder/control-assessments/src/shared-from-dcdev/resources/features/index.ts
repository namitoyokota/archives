import { FrameworkConfiguration } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([
    //PLATFORM.moduleName('./vm-autocomplete/vm-autocomplete', 'global'),
    /*PLATFORM.moduleName('./vm-card/vm-card.component', 'global'),*/
    //PLATFORM.moduleName('./vm-data-table/vm-data-table', 'global'),
    PLATFORM.moduleName('./vm-date-picker/vm-date-picker.component', 'global'),
    PLATFORM.moduleName('./vm-date-picker/vm-date-picker-input/vm-date-picker-input.component', 'global'),
    //PLATFORM.moduleName('./vm-datetime/vm-datetime', 'global'),
    //PLATFORM.moduleName('./vm-form/vm-form.component', 'global'),
    //PLATFORM.moduleName('./vm-form/vm-form-field/vm-form-field.component', 'global'),
    PLATFORM.moduleName('./vm-grid/vm-grid', 'global'),
    PLATFORM.moduleName('./vm-grid-v2/vm-grid-v2', 'global'),
    PLATFORM.moduleName('./vm-grid-v2/command-menu/vm-command-menu', 'global'),
    //PLATFORM.moduleName('./vm-group-select/vm-group-select', 'global'),
    //PLATFORM.moduleName('./vm-multi-select/vm-multi-select', 'global'),
    //PLATFORM.moduleName('./vm-page-size/vm-page-size', 'global'),
    //PLATFORM.moduleName('./vm-script/vm-script', 'global'),
    //PLATFORM.moduleName('./vm-select/vm-select', 'global'),
  ]);
}

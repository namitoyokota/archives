import type { FrameworkConfiguration } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-framework';
import './styles/main.css';

export function configure(config: FrameworkConfiguration): void {
    config.globalResources([
        PLATFORM.moduleName('./elements/vm-alert/vm-alert.component'),
        PLATFORM.moduleName('./elements/vm-badge/vm-badge.component'),
        PLATFORM.moduleName('./elements/vm-breadcrumbs/vm-breadcrumbs.component'),
        PLATFORM.moduleName('./elements/vm-button/vm-button.component'),
        PLATFORM.moduleName('./elements/vm-checkbox/vm-checkbox.component'),
        PLATFORM.moduleName('./elements/vm-checkbox-picklist/vm-checkbox-picklist.component'),
        PLATFORM.moduleName('./elements/vm-context-menu/vm-context-menu.component'),
        PLATFORM.moduleName('./elements/vm-date-picker/vm-date-picker.component'),
        PLATFORM.moduleName('./elements/vm-date-picker/vm-date-picker-view/vm-date-picker-view.component'),
        PLATFORM.moduleName('./elements/vm-dialog/vm-dialog.component'),
        PLATFORM.moduleName('./elements/vm-dialog/vm-dialog-duotone/vm-dialog-duotone.component'),
        PLATFORM.moduleName('./elements/vm-dropdown/vm-dropdown.component'),
        PLATFORM.moduleName('./elements/vm-dropdown/vm-dropdown-item/vm-dropdown-item.component'),
        PLATFORM.moduleName('./elements/vm-form/vm-form.component'),
        PLATFORM.moduleName('./elements/vm-form/vm-form-field/vm-form-field.component'),
        PLATFORM.moduleName('./elements/vm-form/vm-form-wizard/vm-form-wizard.component'),
        PLATFORM.moduleName('./elements/vm-header/vm-header.component'),
        PLATFORM.moduleName('./elements/vm-label/vm-label.component'),
        PLATFORM.moduleName('./elements/vm-pagination/vm-pagination.component'),
        PLATFORM.moduleName('./elements/vm-search/vm-search.component'),
        PLATFORM.moduleName('./elements/vm-tabs/vm-tabs.component'),
        PLATFORM.moduleName('./elements/vm-toggle/vm-toggle.component'),
        PLATFORM.moduleName('./elements/vm-tooltip/vm-tooltip.component'),
    ]);
}

export * from './classes/index';
export * from './constants/index';
export * from './elements/index';
export * from './enums/index';
export * from './interfaces/index';
export * from './services/index';
export * from './utilities/index';
export * from './value-converters/index';

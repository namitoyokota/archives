import { PLATFORM } from 'aurelia-pal';

export abstract class VmGridColumnTemplates {
    static readonly ACTION_LINK: string = PLATFORM.moduleName('./configuration/templates/action-link/action-link', 'global');
    static readonly ACTION_ELLIPSIS: string = PLATFORM.moduleName('./configuration/templates/action-ellipsis/action-ellipsis', 'global');
    static readonly ADDRESS: string = PLATFORM.moduleName('./configuration/templates/address/address', 'global');
    static readonly CONTACT_INFO: string = PLATFORM.moduleName('./configuration/templates/contact-info/contact-info', 'global');
    static readonly FORMAT_LIST: string = PLATFORM.moduleName('./configuration/templates/format-list/format-list', 'global');
    static readonly MAPPED_ARRAY: string = PLATFORM.moduleName('./configuration/templates/mapped-array/mapped-array', 'global');
    static readonly STRING_ARRAY: string = PLATFORM.moduleName('./configuration/templates/string-array/string-array', 'global');
}

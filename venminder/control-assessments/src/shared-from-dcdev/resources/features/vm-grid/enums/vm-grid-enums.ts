enum VmGridColumnFieldType {
    ActionEllipsis = 'actionellipsis',
    Boolean = 'boolean',
    Custom = 'custom',
    Compose = 'compose',
    LinkText = 'linktext',
    Literal = 'literal',
    List = 'list',
    Select = 'select',
    Address = 'address'
}

enum VmGridColumnTextAlign {
    Center = 'center',
    Left = 'left',
    Right = 'right'
}

enum VmGridListDisplayType {
    Delimited = 'delimited',
    UnorderedList = 'unorderedlist'
}

export class VmGridConstants {
    static readonly ACTION_SELECTED_EVENT_PREFIX: string = 'onVmGridAction_Selected';
    static readonly PAGER_LOAD_COMPLETED_EVENT_PREFIX: string = 'onVmGridPagerLoad_Complete';
    static readonly CUSTOM_FILTER_CHANGED_PREFIX: string = 'onVmGridCustomFilter_Changed';
    static readonly CUSTOM_FILTER_REMOVED_PREFIX: string = 'onVmGridCustomFilter_Removed';
}

export {
    VmGridColumnFieldType, VmGridColumnTextAlign, VmGridListDisplayType
}

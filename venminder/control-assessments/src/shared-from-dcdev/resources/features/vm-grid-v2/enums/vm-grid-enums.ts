enum VmGridColumnFieldType {
  ActionLink = 'actionlink',
  ActionEllipsis = 'actionellipsis',
  ActionButton = 'actionbutton',
  Address = 'address',
  Boolean = 'boolean',
  ContactInfo = 'contactinfo',
  Custom = 'custom',
  Date = 'date',
  LinkText = 'linktext',
  Literal = 'literal',
  List = 'list',
  MappedArray = 'mappedarray',
  Number = 'number',
  Progress = 'progress',
  Select = 'select',
  StringArray = 'stringarray',
  Subtext = 'subtext',
  Toggle = 'toggle',
  Tooltip = 'tooltip',
}

enum VmGridTextAlign {
  Left = 'text-align-left',
  Right = 'text-align-right',
  Center = 'text-align-center',
}

enum VmGridColumnPosition {
  StickyLeft = 'sticky-left',
  StickyRight = 'sticky-right',
}

enum VmGridListDisplayType {
  Delimited = 'delimited',
  UnorderedList = 'unorderedlist',
}

export class VmGridConstants {
  static readonly ACTION_SELECTED_EVENT_PREFIX: string = 'onVmGridAction_Selected';
  static readonly PAGER_LOAD_COMPLETED_EVENT_PREFIX: string = 'onVmGridPagerLoad_Complete';
  static readonly CUSTOM_FILTER_CHANGED_PREFIX: string = 'onVmGridCustomFilter_Changed';
  static readonly CUSTOM_FILTER_REMOVED_PREFIX: string = 'onVmGridCustomFilter_Removed';
}

export { VmGridColumnFieldType, VmGridTextAlign, VmGridColumnPosition, VmGridListDisplayType };

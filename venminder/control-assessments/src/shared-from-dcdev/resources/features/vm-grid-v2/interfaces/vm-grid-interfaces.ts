/* eslint-disable @typescript-eslint/no-explicit-any */
import { VMContextMenuService } from '@venminder/vm-library';
import { IDatePickerConfig } from '../../../../resources/features/vm-date-picker/vm-date-picker.interfaces';
import { IVmDataFilterGroupItem } from '../../vm-data-filter/vm-data-filter.interface';
import { VmGridFilterModel } from '../configuration/filterModels';
import { IVmGridColumnWithView } from '../data/vm-data-managed';
import {
  VmGridColumnFieldType,
  VmGridColumnPosition,
  VmGridListDisplayType,
} from '../enums/vm-grid-enums';

interface IVmGridConfig {
  ID: string;
  ButtonOptionsConfig?: IButtonOptionsConfig;
  AllowColumnConfiguration?: boolean;
  AllowLeftColumnSticky?: boolean;
  AllowRightColumnSticky?: boolean;
  ColumnPrefix?: string;
  ColumnDefinitions: Array<any>;
  CustomFilters?: IVmGridCustomFilters;
  DatePickerConfig?: IDatePickerConfig;
  SearchComponent?: string;
  SearchComponentExpandable?: boolean;
  SortNullsToTop?: boolean;
  NoResultsMessage?: string;
}

interface IVmGridCustomFilters {
	FilterList: VmGridFilterModel[];
	FilterContainerHeight?: number;
  FilterComponent?: string;
  FilterModel?: any;
  HidePillbox?: boolean;
}

interface IActionLinkChangeHandler {
  action: (data: any) => void;
  actionableProperty?: string;
  tooltip?: string;
}

interface IActionButtonParams {
  columnHeaderText?: string;
  isDisabled?: boolean;
  size?: string;
  text: string;
  type?: string;
  width: string;
}

interface IButtonOptionsConfig {
  DownloadFilename?: string;
  DownloadFaClass?: string;
  ButtonOptions?: Array<IButtonOptions>;
}

interface IButtonOptions {
  Text: string;
  Click(): void;
  FaClass?: string;
}

interface IValueConverter {}

interface IBoolValueConverter extends IValueConverter {
  TrueState: string;
  FalseState: string;
}

interface IFormatTextValueConverter extends IValueConverter {
  ReplaceText?: string;
  FormatTemplate?: string;
  CheckColumnForTrueState?: string;
}

interface IDateValueConverter extends IValueConverter {
  DateFormat: string;
}

interface INumberValueConverter extends IValueConverter {
  IgnoreFormatIfZero?: boolean;
  NumberFormat: string;
}

interface IVmGridColumn extends IDefaultColumnProperties {
  BindingContext?(
    row: any,
    col: any,
    contextMenu: any,
  ): any;
  ColumnFieldType?: VmGridColumnFieldType;
  ColumnHeaderText?: string;
  ColumnName?: string;
  ColumnTooltipProp?: string;
  ColumnValueConverter?: IValueConverter;
  CommandItems?: Array<IActionCommandConfig>;
  Format?(
    row,
    column,
    converter?,
    ignoreSanitize?,
  ): any;
  GetFilterFormattedValue?: (value: any) => any;
  GetUniqueGroupList?: (
    groupItems: Array<IVmDataFilterGroupItem>,
    groupName: string,
  ) => Array<IVmDataFilterGroupItem>;
  IsActionColumn?: boolean;
  IconClass?: string;
  MappedPropName?: string;
  OrderModels?: IVmGridOrderModel[];
  Position?: VmGridColumnPosition;
  SearchModel?: IVmGridSearchModel;
  SortDirection?: 'asc' | 'desc' | null;
  Width?: number | string;
  ViewModel?: string;
  ShowToolTip?: boolean;
}

interface IDefaultColumnProperties {
  ActionComplete?(data: IVmGridActionEventArgs): void;
  AllowSorting?: boolean;
  CustomSortProperty?: string;
  ExcludeFromDownload?: boolean;
  GroupFilterOrderKeys?: any;
  GroupFilterOrderProp?: string;
  IsCustomFilter?: boolean;
  SortNullsToTop?: boolean;
  TextAlign?: string;
  TextOverflow?: boolean;
  ViewLocked?: boolean;
  Visible?: boolean;
}

interface IDefaultActionEllipsisProperties {
  actionComplete?(data: any): void;
  commandItems?: IActionCommandConfig[];
}

interface IActionEllipsisCommandConfig {
  commandItems: IActionCommandConfig[];
  commandItemsEventHandler?: Function;
}

interface IActionCommandConfig {
  iconClass?: string;
  prefix?: string;
  text: string;
  checkVisibility?(row: any): boolean;
}

interface IVmNumberFormatting {
  SearchFormat: string;
  DisplayFormat?: string;
  IgnoreFormatIfZero?: boolean;
}

interface IActionContext {
  Row: any;
  Column: IVmGridColumn;
  ContextMenu: VMContextMenuService;
}

interface IVmGridSearchModel {
  Filter: any;
  Params?: Object;
}

interface IVmGridFilterResponse {
  ModifiedVmGridRows: Array<any>;
  ViewableVmGridRows: Array<any>;
}

interface IVmGridActionEventArgs {
  command: IActionCommandConfig;
  row: any;
}

interface IVmGridToCsvMap {
  Data: any[];
  Config: IVmGridConfig;
  Columns?: IVmGridColumnWithView[];
}

interface IVmGridOrderModel {
  Name: string;
  OrderBy: string | number;
  CustomSortProperty?: string;
  Direction: 'asc' | 'desc';
  DefaultOrdinal?: number;
  SortNullsToTop?: boolean;
}

interface IFormatListValueConverter extends IValueConverter {
  DisplayType: VmGridListDisplayType;
  ItemDelimiter?: string;
  MaxItems?: number;
  Visible?: boolean;
}

interface ISubtextConfig {
  isSubtextShown: boolean;
  subText: string;
  text: string;
}

interface ITooltipConfig {
  columnText: string;
  isTooltipShown: boolean;
  tooltipText: string;
  tooltipId: string;
}

export type {
  IVmGridConfig,
  IVmGridColumn,
  IVmGridActionEventArgs,
  IVmGridFilterResponse,
  IActionCommandConfig,
  IActionEllipsisCommandConfig,
  IValueConverter,
  IBoolValueConverter,
  IVmGridToCsvMap,
  IVmGridOrderModel,
  IFormatTextValueConverter,
  IDateValueConverter,
  INumberValueConverter,
  IActionContext,
  IButtonOptionsConfig,
  IButtonOptions,
  IDefaultColumnProperties,
  IDefaultActionEllipsisProperties,
  IVmGridSearchModel,
  IVmNumberFormatting,
  IFormatListValueConverter,
  IActionButtonParams,
  IVmGridCustomFilters,
  ISubtextConfig,
  ITooltipConfig,
  IActionLinkChangeHandler,
};

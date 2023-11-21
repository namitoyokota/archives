import { IVmGridColumnWithView } from "../data/vm-data-managed";
import { VmGridColumnFieldType, VmGridColumnTextAlign, VmGridListDisplayType } from "../enums/vm-grid-enums";
import { VmGridFilterModel } from "../utilities/grid-filter-utils";

interface IVmGridConfig {
    ID: string;
    ButtonOptionsConfig?: IButtonOptionsConfig;
    AllowColumnConfiguration?: boolean;
    ColumnPrefix?: string,
    ColumnDefinitions: Array<IVmGridColumn>;
    CustomFilters?: VmGridFilterModel[],
    SearchComponent?: 'search-field',
    SearchComponentExpandable?: boolean;
}

interface IActionContext {
    row: any;
    column: IVmGridColumn;
}

interface IButtonOptionsConfig {
    DownloadFilename?: string;
    ButtonOptions?: Array<IButtonOptions>;
}

interface IButtonOptions {
    Text: string;
    Click?(): void;
}

interface ICommandItemCheckVisibility {
    Command: string;
    CheckCommandVisibility?(row: any): boolean;
}

interface IValueConverter { }

interface IBoolValueConverter extends IValueConverter {
    TrueState: string;
    FalseState: string;
}

interface IFormatTextValueConverter extends IValueConverter {
    ReplaceText: string;
    FormatTemplate: string;
}

interface IFormatListValueConverter extends IValueConverter {
    DisplayType: VmGridListDisplayType;
    ItemDelimiter: string;
    MaxItems: number;
}

interface IVmGridColumn {
    AllowSorting?: boolean;
    ColumnHeaderText?: string;
    ColumnName?: string;
    ColumnFieldType: VmGridColumnFieldType;
    ColumnActionButtonText?: string;
    CommandItems?: Array<string | IActionIconConfig>;
    CommandItemCheckVisibility?: Array<ICommandItemCheckVisibility>;
    ColumnClick?(row: any, event?: any): void;
    ColumnHtmlFormatter?(row: any): string;
    ColumnValueConverter?: IValueConverter;
    ExcludeFromDownload?: boolean;
    IsFiltered?: boolean;
    IsSorted?: boolean;
    TextOverflow?: boolean;
    TextAlign?: VmGridColumnTextAlign;
    Width: number | string;
    OrderModels?: IVmGridOrderModel[];
    FilterModels?: VmGridFilterModel[];
    SearchModel?: {
        Filter: any,
        Params?: Object
    },
    ViewLocked?: boolean,
    ViewModel?: string;
}

interface IActionIconConfig {
    Prefix?: string;
    Text: string;
    IconClass: string;
}

interface IVmGridFilterResponse {
    ModifiedVmGridRows: Array<any>;
    ViewableVmGridRows: Array<any>;
}

interface IVmGridActionEventArgs {
    Command: string | IActionIconConfig;
    Row: any;
}

interface IVmGridToCsvMap {
    data: any[],
    config: IVmGridConfig,
    columns?: IVmGridColumnWithView[]
}

interface IVmGridOrderModel {
    name: string,
    orderBy: string | number,
    direction: 'asc' | 'desc',
    defaultOrdinal?: number
}

export type {
    IVmGridConfig, IVmGridColumn, IVmGridActionEventArgs, ICommandItemCheckVisibility, IVmGridFilterResponse, IActionIconConfig,
    IValueConverter, IBoolValueConverter, IVmGridToCsvMap, IVmGridOrderModel, IFormatListValueConverter, IFormatTextValueConverter, IButtonOptionsConfig,
    IButtonOptions, IActionContext
}

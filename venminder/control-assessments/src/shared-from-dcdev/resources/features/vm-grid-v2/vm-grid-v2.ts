import { EventAggregator } from 'aurelia-event-aggregator';
import { bindable, computedFrom, inject, PLATFORM } from 'aurelia-framework';
import { asyncScheduler, fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import type { ICallbackEventArgs } from '../../../shared/components/overlay-manager/interfaces/overlay-manager-interfaces';
import { VMContextMenuService } from '@venminder/vm-library';
import { VmGridColumnFieldType } from '../vm-grid-v2/enums/vm-grid-enums';
import { VmPopupEvents } from '../vm-popup/vm-popup-constants';
import { IVmPopupEventArgs, IVmPopupViewModel } from '../vm-popup/vm-popup-interfaces';
import { literalFormatting } from './configuration/formatting';
import { VmGridDataManaged } from './data/vm-data-managed';
import type {
  IActionCommandConfig,
  IButtonOptions,
  IFormatTextValueConverter,
  IVmGridColumn,
  IVmGridConfig,
  IVmGridOrderModel,
} from './interfaces/vm-grid-interfaces';
import { getCsv } from './utilities/grid-download-utils';
import { getDateRangeFilter } from './utilities/grid-utils';

enum GridCellClasses {
  OVERFLOW = 'grid-cell--overflow',
  STICKYLEFT = 'grid-cell--sticky-first',
  STICKYRIGHT = 'grid-cell--sticky-last',
  LAST = 'grid-row--last',
}

enum GridHeaderClasses {
  SORTABLE = 'grid-header--sortable',
  OVERFLOW = 'grid-header--overflow',
  LAST = 'grid-header--last',
  STICKYLEFT = 'grid-header--sticky-first',
  STICKYRIGHT = 'grid-header--sticky-last',
}

enum GridContainerClasses {
  SCROLLEDRIGHT = '__scrolled-right',
  SCROLLEDLEFT = '__scrolled-left',
  VISIBLE = '__visible',
}

export class VmGridV2 {
  @bindable config: IVmGridConfig | undefined;
  @bindable customFiltersOn = false;
  @bindable gridData: VmGridDataManaged;
  @bindable maxHeight = '0';
  @bindable showPager = true;
  @bindable keypressCallback: Function;
  @bindable selectedRows: Array<any> = [];
  @bindable hideFilterPills: boolean = false;

  allRowsSelected = false;

  buttonOptions: Array<IButtonOptions> = [];
  buttonHeightOffset = 36;

  gridBody: HTMLElement;
  gridContainer: HTMLElement;
  gridHeader: HTMLElement;

  getGridColumnStyles = '';

  shadowClasses = '';

  showGridButtonOptions = false;
  showGridDownloadButton = false;
  showGridDownloadIcon = false;

  gridContainerScrollSubscription: Subscription;
  gridStyleSubscription: Subscription;
  mergeTooltipSubscription: Subscription;
  windowResizeSubscription: Subscription;
  windowKeypressSubscription: Subscription;

  scrollableClassList = '';

  private debounceValue = 250;
  private maxTooltipLength = 300;

  constructor(
    @inject(VMContextMenuService) protected contextMenu: VMContextMenuService,
    @inject(EventAggregator) private ea: EventAggregator,
  ) {}

  @computedFrom('maxHeight')
  get gridStyle(): string {
    return `max-height: ${this.maxHeight};`;
  }

    @computedFrom('config')
    get showPillbox() {
        const hide = this.config?.CustomFilters?.HidePillbox;
        return hide ? !hide : true;
    }

    attached(): void {
        this.buttonOptions = this.config.ButtonOptionsConfig?.ButtonOptions || [];

    this.showGridButtonOptions = this.buttonOptions.length > 0;
    this.showGridDownloadButton = !!this.config.ButtonOptionsConfig?.DownloadFilename;
    this.showGridDownloadIcon = !!this.config.ButtonOptionsConfig?.DownloadFaClass;

    this.gridStyleSubscription = this.gridData.getRowStyle().subscribe((rowStyle: { style: string }) => {
      this.getGridColumnStyles = rowStyle.style;
    });

    this.gridData.onLoad().subscribe(() => {
      this.handleScrollStyle();
      this.checkGridCellTooltips();
    });

    this.gridContainerScrollSubscription = fromEvent(this.gridContainer, 'scroll')
      .pipe(throttleTime(150, asyncScheduler, { leading: true, trailing: true }))
      .subscribe(() => this.handleScrollStyle());

    this.windowKeypressSubscription = fromEvent(window, 'keypress').subscribe((e) => {
      if (this.keypressCallback) {
        this.keypressCallback(e);
      }
    });

    this.mergeTooltipSubscription = merge(
      fromEvent(window, 'resize').pipe(debounceTime(this.debounceValue, asyncScheduler)),
      this.gridData.changes.getFilterChanges().pipe(debounceTime(this.debounceValue, asyncScheduler)),
      this.gridData.changes.getPaginationChanges().pipe(debounceTime(this.debounceValue, asyncScheduler)),
    ).subscribe(() => {
      this.checkGridCellTooltips();
    });

    this.windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => this.handleScrollStyle());

    this.getDirection();

    if (!this.config.NoResultsMessage) {
      this.config.NoResultsMessage = 'No results.';
    }
  }

  changeOrder(column: IVmGridColumn): void {
    if (!column.AllowSorting) {
      return;
    }

    let order: Array<IVmGridOrderModel> = [];

    if (!column.SortDirection || column.SortDirection === 'desc') {
      order = [
        {
          Name: column.ColumnHeaderText,
          CustomSortProperty: column.CustomSortProperty,
          Direction: 'asc',
          OrderBy: column.ColumnName,
          SortNullsToTop: column.SortNullsToTop || this.config.SortNullsToTop,
        },
      ];
    } else if (column.SortDirection === 'asc') {
      order = [
        {
          Name: column.ColumnHeaderText,
          CustomSortProperty: column.CustomSortProperty,
          Direction: 'desc',
          OrderBy: column.ColumnName,
          SortNullsToTop: column.SortNullsToTop || this.config.SortNullsToTop,
        },
      ];
    }

    this.gridData.set({ order });
    this.getDirection(column);
  }

  checkGridCellTooltips(): void {
    let id = '';
    let cell: HTMLElement;

    this.gridData.columns.forEach((column) => {
      if (column.TextOverflow) {
        id = this.getUniqueHeaderCellID(column.ColumnName);
        cell = document.querySelector(`#${id}`);
        column.ShowToolTip = cell.scrollWidth > cell.clientWidth;
      }
    });

    this.gridData.rows.forEach((row, rowIndex) => {
      this.gridData.columns.forEach((column) => {
        if (column.TextOverflow && column.ColumnFieldType === VmGridColumnFieldType.Literal) {
          id = this.getUniqueRowCellID(rowIndex, column.ColumnName);
          cell = document.querySelector(`#${id}`);

          if (cell) {
            column.ColumnTooltipProp = column.ColumnName + 'ShowToolTip';
            row[column.ColumnTooltipProp] = cell.scrollWidth > cell.clientWidth;
          }
        }
      });
    });
  }

  detached(): void {
    this.gridContainerScrollSubscription?.unsubscribe();
    this.gridStyleSubscription?.unsubscribe();
    this.mergeTooltipSubscription?.unsubscribe();
    this.windowResizeSubscription?.unsubscribe();
    this.windowKeypressSubscription?.unsubscribe();

    this.windowKeypressSubscription.unsubscribe();
  }

  downloadCSV(): void {
    getCsv({ Data: this.gridData.modifiedSource, Config: this.config, Columns: this.gridData.columns });
  }

  formatTooltip(row: any, column: IVmGridColumn): string {
    if (column.ColumnFieldType === VmGridColumnFieldType.Literal) {
      const tooltip: string = literalFormatting.Format(
        row,
        column.ColumnName,
        <IFormatTextValueConverter>column.ColumnValueConverter,
        true,
      );
      return tooltip.substring(0, this.maxTooltipLength - 1);
    }

    return '';
  }

  getCellClasses(column, first, last, rowIndex): string {
    const classes = [];

    if (column.TextOverflow) {
      classes.push(GridCellClasses.OVERFLOW);
    }

    if (first && this.config.AllowLeftColumnSticky) {
      classes.push(GridCellClasses.STICKYLEFT);
    }

    if (last && this.config.AllowRightColumnSticky) {
      classes.push(GridCellClasses.STICKYRIGHT);
    }

    if (this.gridData.rows.length - 1 === rowIndex) {
      classes.push(GridCellClasses.LAST);
    }

    return classes.join(' ');
  }

  getDirection(sortedColumn?: IVmGridColumn): void {
    this.gridData.columns.forEach((column) => {
      column.SortDirection = null;
    });

    const orders = this.gridData.orders.map((order: IVmGridOrderModel) => order.OrderBy);

    if (!sortedColumn) {
      sortedColumn = this.gridData.columns.find((f) => f.ColumnName === orders[0]);
    }

    if (orders.includes(sortedColumn?.ColumnName)) {
      sortedColumn.SortDirection = this.gridData.orders.find(
        (order: IVmGridOrderModel) => order.OrderBy === sortedColumn.ColumnName,
      ).Direction;
    }

    return null;
  }

  getFilterModel() {
    return { gridData: this.gridData, config: this.config };
  }

  getHeaderClasses(column, first, last): string {
    const classes = [];

    if (column.TextOverflow) {
      classes.push(GridCellClasses.OVERFLOW);
    }

    if (column.AllowSorting) {
      classes.push(GridHeaderClasses.SORTABLE);
    }

    if (first && this.config.AllowLeftColumnSticky) {
      classes.push(GridHeaderClasses.STICKYLEFT);
    }

    if (last) {
      classes.push(GridHeaderClasses.LAST);

      if (this.config.AllowRightColumnSticky) {
        classes.push(GridHeaderClasses.STICKYRIGHT);
      }
    }

    return classes.join(' ');
  }

  getUniqueHeaderCellID(columnName): string {
    return `grid-header${this.config.ID}${columnName}`;
  }

  getUniqueRowCellID(index, columnName): string {
    return `grid-cell${this.config.ID}${index}${columnName}`;
  }

  handleScrollStyle(): void {
    const classes = [];

    classes.push(GridContainerClasses.VISIBLE);

    if (this.gridContainer?.scrollLeft > 0) {
      classes.push(GridContainerClasses.SCROLLEDRIGHT);
    }

    if (Math.ceil(this.gridContainer.scrollLeft) < this.gridContainer.scrollWidth - this.gridContainer.clientWidth) {
      classes.push(GridContainerClasses.SCROLLEDLEFT);
    }

    this.gridContainer.style.setProperty('--grid-scroll-top', `${this.gridContainer.scrollTop}px`);
    this.gridContainer.style.setProperty('--grid-scroll-left', `${this.gridContainer.scrollLeft}px`);

    this.scrollableClassList = classes.join(' ');
  }

  openColumnsConfiguration(event: Event): void {
    const width = 450;
    const containerHeight = 550;
    const el = <HTMLElement>event.target;

    const viewModel: IVmPopupEventArgs = {
      Callback: (eventArgs: ICallbackEventArgs) => {
        if (eventArgs.Data) {
          this.gridData.set({
            columnSettings: eventArgs.Data.columnSettings,
          });
        }
      },
      View: PLATFORM.moduleName('./dialogs/column-configuration', 'global'),
      Model: <IVmPopupViewModel>{
        ActionNeeded: true,
        ControlID: 'myPopupId',
        ContainerWidth: width,
        ContainerHeight: containerHeight,
        Left: el.offsetLeft - width,
        Top: el.offsetTop,
        Title: 'Customize Columns',
        Data: {
          columnSettings: { ...this.gridData.columnSettings },
        },
      },
    };

    this.ea.publish(VmPopupEvents.ON_SHOW_POPUP, viewModel);
  }

  openContextMenu(event: any, row: any, column: IVmGridColumn): void {
    this.contextMenu.open({
      y: event.y,
      x: event.x,
      component: PLATFORM.moduleName('./command-menu/vm-command-menu'),
      data: {
        commandItems: column.CommandItems.filter((item) => {
          return !item.checkVisibility || item.checkVisibility(row);
        }),
        row: row,
      },
      methods: {
        click: (params: { commandItem: IActionCommandConfig; row: any }) => {
          if (column.ActionComplete) {
            column.ActionComplete({
              command: params.commandItem,
              row: params.row,
            });
          } else {
            throw new Error("'Clicked' event not implemented.");
          }
          this.contextMenu.close();
        },
      },
    });
  }

  openDateFilter(event): void {
    let el: HTMLElement = event.target;
    el = el.closest('.btn-default');

    const rect = el.getBoundingClientRect();
    const elX = event.clientX - rect.left;
    const elY = event.clientY - rect.top;

    this.contextMenu.open({
      y: event.clientY + (this.buttonHeightOffset - elY),
      x: event.clientX - elX,
      component: PLATFORM.moduleName('../vm-date-picker/vm-date-picker.component', 'global'),
      data: {
        displayType: this.config.DatePickerConfig.DisplayType,
        dateRangeOptions: this.config.DatePickerConfig.DateRangeOptions,
      },
      methods: {
        onDateSelected: (option) => {
          this.filterDateRange(option);
          this.contextMenu.close();
        },
      },
    });
  }


  performAction(event: any, row: any, column: IVmGridColumn): void {
    const el = <HTMLElement>event.target;

    if (!el.classList.contains('action-element')) {
      return;
    }

    switch (column.ColumnFieldType) {
      case VmGridColumnFieldType.ActionButton:
      case VmGridColumnFieldType.LinkText:
        column.ActionComplete(row);
        break;
      case VmGridColumnFieldType.ActionEllipsis:
        this.openContextMenu(event, row, column);
        break;
      default:
        break;
    }
  }

  private filterDateRange(option): void {
    const index = this.gridData.filters.findIndex((g) => g.group.includes('search-date-range'));

    if (index >= 0) {
      this.gridData.filters.splice(index, 1);
    }

    this.gridData.set({
      filter: [...this.gridData.filters, ...getDateRangeFilter(option, this.config.DatePickerConfig)],
    });
  }
}

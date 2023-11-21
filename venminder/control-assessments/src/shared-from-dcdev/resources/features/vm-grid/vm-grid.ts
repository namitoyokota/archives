import { inject, bindable, PLATFORM } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import type { IVmGridConfig, ICommandItemCheckVisibility, IVmGridActionEventArgs, IActionIconConfig, IButtonOptions } from "./interfaces/vm-grid-interfaces";
import { VmGridConstants } from "./enums/vm-grid-enums";
import { getCsv } from "./utilities/grid-dowload-utils";
import { isEqual } from "lodash";
import type { IPopupEventArgs, IPopupViewModel } from "shared-from-dcdev/shared/components/popups/interfaces/popup-interfaces";
import type { ICallbackEventArgs } from "shared-from-dcdev/shared/components/overlay-manager/interfaces/overlay-manager-interfaces";
import { PopupEvents } from "shared-from-dcdev/shared/components/popups/constants/popup-constants";
import { VmGridDataAbstract } from "./data/vm-data-abstract";
import { getGridRowStyle } from "./utilities/grid-utils";
import { VMContextMenuService } from '@venminder/vm-library';
import { IFormatListValueConverter } from "./interfaces/vm-grid-interfaces";


export class VmGrid {
    @bindable config: IVmGridConfig | undefined;
    @bindable horizontalScroll: boolean = false;
    @bindable gridData: VmGridDataAbstract;
    @bindable gridHeight = 0;

    gridBody: HTMLElement | undefined;

    buttonOptions: Array<IButtonOptions> = [];

    showGridButtonOptions = false;
    showGridDownloadButton = false;

    gridRowStyle = '';
    constructor(
        @inject(EventAggregator) protected ea: EventAggregator,
        @inject(VMContextMenuService) protected contextMenu: VMContextMenuService
    ) {}

    attached(): void {
        this.buttonOptions = this.config.ButtonOptionsConfig?.ButtonOptions || [];
        this.showGridDownloadButton = !!this.config.ButtonOptionsConfig?.DownloadFilename;
        this.showGridButtonOptions = (!!this.config.ButtonOptionsConfig && (!!this.config.ButtonOptionsConfig.DownloadFilename || this.buttonOptions.length > 0));

        this.gridBody = document.getElementById(`vm-grid-body${this.config.ID}`);

        this.gridRowStyle = getGridRowStyle(this.config);

    }
    detached() {
    }
    
    getFilterView(key: string) {
        return './filters/' + this.config[key] + '/' + this.config[key];
    }
    getFilterModel() {
        return { gridData: this.gridData, config: this.config };
    }

    openCommandItems(ev, commandItems: Array<any>, commandItemCheckVisibility: Array<ICommandItemCheckVisibility>, row: any) {
        this.contextMenu.open({
            y: ev.y,
            x: ev.x,
            component: PLATFORM.moduleName('shared-from-dcdev/resources/features/vm-grid/command-menu/vm-command-menu', 'global'),
            data: {
                commandItems: commandItems.filter(item => {
                    let showCommandItem = true;
                    const commandItemCheckVisibilityItem = commandItemCheckVisibility?.filter(c => c.Command == (item.Text || item))[0];
                    if (commandItemCheckVisibilityItem != undefined) {
                        showCommandItem = commandItemCheckVisibilityItem.CheckCommandVisibility(row);
                        showCommandItem = ((showCommandItem != undefined) ? showCommandItem : false);
                    }
                    if (showCommandItem) {
                        return item;
                    }
                }),
                row,
                eventID: VmGridConstants.ACTION_SELECTED_EVENT_PREFIX + this.config.ID
            },
            methods: {
                click: (params: { commandItem: string, eventID: string, row: any }) => {
                    this.ea.publish(params.eventID, <IVmGridActionEventArgs>{
                        Command: params.commandItem,
                        Row: params.row
                    });
                    this.contextMenu.close()
                }
            }
        })
    }
    openColumnsConfiguration(event: Event) {
        const width = 350;
        const el = <HTMLElement>event.target;

        const viewModel: IPopupEventArgs = {
            Callback: (eventArgs: ICallbackEventArgs) => {
            },
            View: PLATFORM.moduleName('shared-from-dcdev/resources/features/vm-grid/dialogs/column-configuration', 'global'),
            Model: <IPopupViewModel>{
                ActionNeeded: true,
                ControlID: 'myPopupId',
                ContainerWidth: width,
                ContainerHeight: 500,
                Left: (el.offsetLeft - width),
                Top: el.offsetTop,
                Title: 'Customize Columns',
                SmokeBackground: true
            }
        };

        this.ea.publish(PopupEvents.ON_SHOW_POPUP, viewModel);

    }

    showMenu(row, commandRow) {
        return isEqual(row, commandRow);
    }

    formatListTooltip(value: string[]) {
        return value ? value.join(', ') : '';
    }

    disableListTooltip(value: string[], columnValueConverter: IFormatListValueConverter) {
        const maxItems = columnValueConverter ? columnValueConverter.MaxItems : -1;
        const valueLength = value ? value.length : 0;

        return maxItems > 0 ? maxItems >= valueLength : false;
    }

    downloadCSV() {
        getCsv({ data: this.gridData.modifiedSource, config: this.config });
    }
}

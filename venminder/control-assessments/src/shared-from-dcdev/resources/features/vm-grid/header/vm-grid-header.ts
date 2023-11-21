import { bindable } from "aurelia-framework";
import { VmGridDataAbstract } from "../data/vm-data-abstract";
import type { IVmGridConfig } from "../interfaces/vm-grid-interfaces";
import { getGridRowStyle } from "../utilities/grid-utils";

export class VmGridHeader {
    @bindable config: IVmGridConfig;
    @bindable parentId: string;
    @bindable gridData: VmGridDataAbstract

    private gridHeaderContainer: HTMLElement | undefined;
    gridRowStyle = '';
    
    attached() {
        this.gridRowStyle = getGridRowStyle(this.config)
    }
}

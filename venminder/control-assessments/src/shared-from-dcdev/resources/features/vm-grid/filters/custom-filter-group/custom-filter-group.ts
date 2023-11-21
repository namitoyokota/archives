import { bindable } from "aurelia-framework";
import { uniq } from 'lodash';
import { Subscription } from 'rxjs';
import { VmGridDataAbstract } from '../../data/vm-data-abstract';
import { VmGridDataManaged } from "../../data/vm-data-managed";
import type { IVmGridConfig } from '../../interfaces/vm-grid-interfaces';
import { VmGridBooleanModel, VmGridFilterModel } from '../../utilities/grid-filter-utils';

interface FilterGroup {
    groupName: string,
    open: boolean,
    active: boolean,
    filters: VmGridFilterModel[],
    visible: boolean
}

export class CustomFilterGroup {
    @bindable gridData: VmGridDataManaged
    @bindable customFilters;

    columnChangesSubscription: Subscription;
    filterList: VmGridFilterModel[] = [];
    filterGroups: FilterGroup[] = [];
    filterSubscription: Subscription;
    columnSubscription: Subscription;

    constructor() { }

    attached() {
        window.addEventListener("click", this.handleFilterPanel.bind(this));


        this.filterSubscription = this.gridData.changes.getFilterChanges().subscribe(() => {

            this.filterList.filter(filterModel => !this.gridData.filters.includes(filterModel))
                .map(filterModel => filterModel.active = false);
            this.filterGroups.forEach(filterGroup => filterGroup.active = filterGroup.filters.some(filter => filter.active));
        })

        this.filterList = this.customFilters;

        this.handleFilterGroups()

        this.columnSubscription = this.gridData.changes.getColumnChanges().subscribe(() => this.handleFilterGroups())
    }

    handleFilterGroups() {
        let hiddenColumns = Object.values(this.gridData.columnSettings).filter(column => column.View.Visible === false).map(column => column.ColumnName)

        this.filterGroups = uniq(this.filterList.map(filterModel => filterModel.group))
            .map(group => {
                return {
                    groupName: group,
                    open: false,
                    active: false,
                    filters: this.filterList.filter(filterModel => filterModel.group === group),
                    visible: this.filterList.filter(filterModel => filterModel.group === group)
                        .some(filterModel => !hiddenColumns.includes(filterModel.columnReference))
                };
            })

    }

    detached() {
        window.removeEventListener("click", this.handleFilterPanel);
        this.filterSubscription.unsubscribe();
        this.columnSubscription.unsubscribe();
    }

    handleFilterPanel(event: Event) {
        const el = <HTMLElement>event.target;
        const isPanel = el.closest('[data-group-panel]');
        
        if (!isPanel) {
            if (el.getAttribute('data-group-button')) {
                this.filterGroups.filter(filterGroup => filterGroup.groupName !== el.getAttribute('data-group-button')).forEach(filterGroup => filterGroup.open = false);
            } else {
                this.filterGroups.forEach(filterGroup => filterGroup.open = false);
            }
        }
    }

    updateGroupState(currentGroup: FilterGroup) {
        currentGroup.active = currentGroup.filters.some(filter => filter.active);
        this.addFiltersToGridState();
    }
    togglePanel(currentGroup: FilterGroup) {
        currentGroup.open = !currentGroup.open;
    }
    selectAll(currentGroup: FilterGroup) {
        currentGroup.filters.forEach(filter => filter.active = true);
        this.updateGroupState(currentGroup);
    }
    deselectAll(currentGroup: FilterGroup) {
        currentGroup.filters.forEach(filter => filter.active = false);
        this.updateGroupState(currentGroup);
    }
    addFiltersToGridState() {
        let currentGroups = this.filterGroups.map(filterGroup => filterGroup.groupName);
        let gridFilters = this.gridData.filters.filter(filterModel => !currentGroups.includes(filterModel.group));

        this.gridData.set({
            filter: [
                ...gridFilters,
                ...this.filterList.filter((filterModel: VmGridFilterModel) => filterModel.active)
            ]
        });
    }

}
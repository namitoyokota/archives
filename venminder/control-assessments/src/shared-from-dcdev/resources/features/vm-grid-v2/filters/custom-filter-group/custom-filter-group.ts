import { bindable } from 'aurelia-framework';
import { uniq } from 'lodash';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { VmGridDataManaged } from '../../data/vm-data-managed';
import { VmGridFilterModel } from '../../configuration/filterModels';
import type { IVmGridCustomFilters } from '../../interfaces/vm-grid-interfaces';
import { DataFilterGroup } from '../../../vm-data-filter/vm-data-filter.component';

export interface FilterGroup {
  groupName: string,
  open: boolean,
  active: boolean,
  filters: VmGridFilterModel[],
  visible: boolean,
  customClickHandler: (event, groupName) => void
}

export class CustomFilterGroup {
  @bindable gridData: VmGridDataManaged
  @bindable customFilters: IVmGridCustomFilters;

  columnChangesSubscription: Subscription;
  filterList: VmGridFilterModel[] = [];
  filterGroups: FilterGroup[] = [];
  filterSubscription: Subscription;
  columnSubscription: Subscription;
  moreFilterSubscription: Subscription;

  filterContainerHeightStyle = '';

  attached(): void {
    window.addEventListener("click", this.handleFilterPanel.bind(this));

    this.filterSubscription = this.gridData.changes.getFilterChanges().subscribe(() => {

      this.filterList.filter(filterModel => !this.gridData.filters.includes(filterModel))
        .map(filterModel => filterModel.active = false);
      this.filterGroups.forEach(filterGroup => filterGroup.active = filterGroup.filters.some(filter => filter.active));
    })

    this.filterContainerHeightStyle = (this.customFilters.FilterContainerHeight) ? `max-height:${this.customFilters.FilterContainerHeight}px;` : '';

    this.filterList = this.customFilters.FilterList;

    this.handleFilterGroups();

    this.columnSubscription = this.gridData.changes.getColumnChanges().subscribe(() => this.handleFilterGroups());

    this.moreFilterSubscription = this.gridData.changes.getMoreFilterChanges().pipe(
      map((value: { type: string, [key: string]: any }) => value.active)
    ).subscribe((active: boolean) => this.handleMoreFilterChanges(active));
  }

  detached(): void {
    window.removeEventListener("click", this.handleFilterPanel);
    this.filterSubscription.unsubscribe();
    this.columnSubscription.unsubscribe();
    this.moreFilterSubscription.unsubscribe();
  }

  updateGroupState(currentGroup: FilterGroup): void {
    currentGroup.active = currentGroup.filters.some(filter => filter.active);
    this.addFiltersToGridState();
  }

  togglePanel(currentGroup: FilterGroup, event): void {
    if (currentGroup.customClickHandler) {
      currentGroup.customClickHandler(event, currentGroup);
    }
    else {
      currentGroup.open = !currentGroup.open;
    }
  }

  selectAll(currentGroup: FilterGroup): void {
    currentGroup.filters.forEach(filter => filter.active = true);
    this.updateGroupState(currentGroup);
  }

  deselectAll(currentGroup: FilterGroup): void {
    currentGroup.filters.forEach(filter => filter.active = false);
    this.updateGroupState(currentGroup);
  }

  private handleFilterGroups(): void {
    let hiddenColumns = Object.values(this.gridData.columnSettings).filter(column => column.View.Visible === false).map(column => column.ColumnName);
    
    this.filterGroups = uniq(this.filterList.map(filterModel => filterModel.group))
      .map(group => {
        return {
          customClickHandler: this.filterList.find(filterModel => filterModel.group === group)?.customClickHandler,
          groupName: group,
          open: false,
          active: false,
          filters: this.filterList.filter(filterModel => filterModel.group === group),
          visible: this.filterList.filter(filterModel => filterModel.group === group)
            .some(filterModel => !hiddenColumns.includes(filterModel.columnReference))
        };
      });
  }

  private handleFilterPanel(event: Event): void {
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

  private addFiltersToGridState(): void {
    let currentGroups = this.filterGroups.map(filterGroup => filterGroup.groupName);
    let gridFilters = this.gridData.filters.filter(filterModel => !currentGroups.includes(filterModel.group));

    this.gridData.set({
      filter: [
        ...gridFilters,
        ...this.filterList.filter((filterModel: VmGridFilterModel) => filterModel.active)
      ]
    });
  }

  private handleMoreFilterChanges(active: boolean): void {
    const group = this.filterGroups.filter((group) => group.groupName == DataFilterGroup.MORE_FILTER_GROUP_NAME)[0];

    if (group) {
      group.active = active;
    }
  }
}

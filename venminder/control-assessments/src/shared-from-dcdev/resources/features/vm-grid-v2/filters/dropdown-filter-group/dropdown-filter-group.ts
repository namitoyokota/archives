import { BindingSignaler } from 'aurelia-templating-resources';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { IVmGridConfig } from 'shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces';
import { Subscription } from 'rxjs';
import { VmGridDataManaged } from "shared-from-dcdev/resources/features/vm-grid-v2/data/vm-data-managed";
import { VmGridFilterModel } from "shared-from-dcdev/resources/features/vm-grid-v2/configuration/filterModels";
import { inject } from 'aurelia-dependency-injection';

interface ConfigFilterModel {
  Groups: string[]
}

interface FilterGroup {
  groupName: string,
  filters: VmGridFilterModel[],
  showFilters: VmGridFilterModel[],
  searchTerm: string,
  dirty: boolean
}

export class DropdownFilterGroup {
    gridData: VmGridDataManaged;
    config: IVmGridConfig;
    filterList: VmGridFilterModel[] = [];
    selectedFilterNames: { [key:string]: string[]} = { }
    filterGroups: FilterGroup[] = [];
    filterSubscription: Subscription;
    columnSubscription: Subscription;

    search$ = new Subject<{ group: FilterGroup }>();
    searchSubscription$;

    constructor(@inject(BindingSignaler) private signaler: BindingSignaler) { }

  activate(model: { gridData: VmGridDataManaged, config: IVmGridConfig }) {
    this.gridData = model.gridData;
    this.config = model.config;
    this.filterList = this.config.CustomFilters.FilterList

    this.filterSubscription = this.gridData.changes.getFilterChanges().subscribe(() => {
      this.filterList = this.config.CustomFilters.FilterList
      this.selectedFilterNames = Object.assign({},
        ...this.config?.CustomFilters?.FilterModel?.Groups
          .map((g: string) => Object.assign(
            { [g]: this.gridData.filters
              .filter((f: VmGridFilterModel) => f.group === g)
              .map((f: VmGridFilterModel) => f.name) 
            }
          ))
        )

      this.filterList.filter(filterModel => !this.gridData.filters.includes(filterModel))
        .map(filterModel => filterModel.active = false);

      this.handleFilterGroups();

      /* this forces the is-selected bound function to execute */
      this.signaler.signal('filter-update');
    })


    this.initFilterGroups();

    this.searchSubscription$ = this.search$.pipe(
      debounceTime(350),
      map(({ group }: { searchTerm: string, group: FilterGroup }): { searchTerm: string, groupName: string, showFilters: VmGridFilterModel[] } => {
        let findGroup = this.filterGroups.find(g => g.groupName === group.groupName)
        let showFilters = (group.searchTerm.length) ? findGroup.filters.filter((f: VmGridFilterModel) => f.name?.toLowerCase()?.includes(group.searchTerm?.toLowerCase() || '')) : findGroup.filters
        return {
          searchTerm: group.searchTerm,
          groupName: group.groupName,
          showFilters
        }
      })
    ).subscribe(({ searchTerm, groupName, showFilters }: { searchTerm: string, groupName: string, showFilters: VmGridFilterModel[] }) => {
      const updateGroup = this.filterGroups.find(g => g.groupName === groupName);
      updateGroup.searchTerm = searchTerm;
      updateGroup.showFilters = showFilters;
      updateGroup.dirty = true;
    })
  }
  
  initFilterGroups() {
    this.filterGroups = (this.config.CustomFilters.FilterModel as ConfigFilterModel).Groups.map((group): FilterGroup => {
      let filters = this.filterList.filter(filterModel => filterModel.group === group)
      return Object.assign({
        groupName: group,
        filters,
        searchTerm: '',
        showFilters: filters,
        dirty: false,
      })
    })
  }

  handleFilterGroups() {
    let products = this.filterGroups.find((g: FilterGroup) => g.groupName === 'Products')
    products.filters.splice(0, products.filters.length)
    products.filters.push(...this.filterList.filter((f: VmGridFilterModel) => f.group === 'Products'))
    this.search$.next({ group: products })
  }

  detached() {
    this.filterSubscription.unsubscribe();
  }

  selectFilter(filter: VmGridFilterModel) {
      if (this.gridData.filters.find((f: VmGridFilterModel) => f.name === filter.name)) {
        this.gridData.set({
          filter: this.gridData.filters.filter((f: VmGridFilterModel) => f.name !== filter.name)
        })
      } else {
        this.gridData.set({
          filter: [
            ...this.gridData.filters,
            filter
          ]
        })
      }
  }

  search(group: FilterGroup) {
    this.search$.next({ group })
  }

  checkSelected(item: VmGridFilterModel) {
    return !!this.selectedFilterNames?.[item.group]?.includes(item.name)
  }

  selectAll(group: FilterGroup) {
    this.gridData.set({
      filter: [
        ...this.gridData.filters,
        ...group.showFilters
      ]
    })
  }
  selectNone(group: FilterGroup) {
    this.gridData.set({
      filter: this.gridData.filters.filter((f: VmGridFilterModel) => f.group !== group.groupName)
    })
  }
}

import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Alarm$v1, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { AlarmWithDeviceAdapterService$v1 } from '@galileo/web_commonassociation/adapter';
import { CommonlocalizationAdapterService$v1, DateFormat } from '@galileo/web_commonlocalization/adapter';
import { from, Subject } from 'rxjs';
import { filter, first, map, mergeMap, takeUntil } from 'rxjs/operators';

import { CoreService } from '../../core.service';
import { DataService } from '../../data.service';
import { TranslationTokens } from './clear-alarms-dialog.translation';

@Component({
    templateUrl: 'clear-alarms-dialog.component.html',
    styleUrls: ['clear-alarms-dialog.component.scss']
})
export class ClearAlarmsDialogComponent implements OnInit, OnDestroy {

    /** Sorting handler for table columns. */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    /** List of alarms. Used for the table data so it can be changed/updated by the isModified property. */
    alarms: Alarm$v1[] = [];

    /** Data source for mat table. */
    dataSource: MatTableDataSource<Alarm$v1>;

    /** Expose date formats to html. */
    dateFormats: typeof DateFormat = DateFormat;

    /** Associated device id. */
    deviceId$ = from(this.alarmWithDeviceSrv.getAssociationsAsync()).pipe(
        mergeMap(data => data)
    ).pipe(map(associations => {
        return associations.filter((association) => {
            return !!this.data.ids.find(id => id === association.alarmId);
        })[0].deviceId;
    }));

    /** Columns to display in table. */
    displayedColumns: string[] = ['select', 'title', 'date'];

    /** Number of managed alarms. */
    managedCount = 0;

    /** Holds the first row to get clicked without hotkeys. Used for shift and ctrl clicking the rows */
    prevSelectedRows: Alarm$v1[] = [];

    /** Expose restrict ids to html. */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Whether or not to show managed alarms. Defaults to false. */
    showManaged = false;

    /** Controls selected elements within table. */
    selection = new SelectionModel<Alarm$v1>(true, []);

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Current user tenant */
    tenantId: string;

    /** Total number of alarms, including managed alarms. */
    totalCount = 0;

    /** A flag that is true if the device should be shown */
    hideDevice = false;

    /** A flag that is true if data is loading */
    isLoading = false;

    private destroy$: Subject<void> = new Subject<void>();

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
        private alarmStore: StoreService<Alarm$v1>,
        private alarmWithDeviceSrv: AlarmWithDeviceAdapterService$v1,
        private dataSrv: DataService,
        private dialogRef: MatDialogRef<ClearAlarmsDialogComponent>,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private coreSrv: CoreService) { }

    /**
     * Oninit lifecycle hook
     */
    ngOnInit() {
        this.hideDevice = this.data.hideDevice;
        this.tenantId = this.data.tenantId;
        this.sort.sort({ id: 'title', start: 'asc', disableClear: false });
        this.alarmStore.entity$.pipe(
            filter(data => !!data), 
            first()
        ).subscribe(alarms => {
            // Filter alarms based on the ids passed in
            let alarmList = alarms.filter(alarm => {
                return !!this.data.ids.find(id => id === alarm.id);
            });

            this.totalCount = alarmList.length;

            // Return top priority
            if (alarmList?.length) {
                alarmList = alarmList.sort((a, b) => {
                    return a.priority - b.priority;
                });
            }

            this.alarms = alarmList.map(alarm => new Alarm$v1(alarm));

            // Set alarms from another tenant to be managed
            this.alarms.forEach(alarm => {
                if (this.tenantId) {
                    alarm.isManaged = this.tenantId !== alarm.tenantId ? true : alarm.isManaged;
                }
            });

            this.managedCount = this.alarms.filter((alarm) => {
                return alarm.isManaged;
            }).length;
            this.setUpTable();

            if (this.data.selectAll) {
                this.masterToggle();
            }

        });

        this.initLocalization();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalization();
            }
        });
    }

    /** Function ran on component destroy. */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Deletes selected alarms and closes the dialog. */
    async clearAlarms() {
        if (await this.coreSrv.confirmDeleteAsync()) {
            this.isLoading = true;
            await this.dataSrv.deleteUnmanagedAlarms$(this.selection.selected.map(alarm => alarm.id)).toPromise();
            this.close();
        }
    }

    /** Closes nested view. */
    close(): void {
        this.dialogRef.close();
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.totalCount - this.managedCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): void {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.dataSource.data.forEach(row => {
                if (!row.isManaged) {
                    this.selection.select(row);
                }
            });
        }
    }

    /** Toggles managed alarms. */
    toggleManaged(): void {
        this.showManaged = !this.showManaged;
        this.setUpTable();
    }

    /** Toggles row selection if the action menu is not the clicked element. */
    toggleRow($event: any, row: Alarm$v1) {
        if (row.isManaged) {
            return;
        }

        this.dataSource.sortData(this.dataSource.filteredData, this.dataSource.sort);
        const newPos = this.dataSource.filteredData.findIndex(x => x === row);
        const lastSelected = this.prevSelectedRows[this.prevSelectedRows.length - 1];
        const originalPos = this.dataSource.filteredData.findIndex(x => x === lastSelected);

        // click
        if (!$event.ctrlKey && !$event.shiftKey) {
            if (this.selection.isSelected(row)) {
                const index = this.prevSelectedRows.findIndex(x => x === row);
                if (index !== -1) {
                    this.prevSelectedRows.splice(index, index + 1);
                }
            }
            if (!this.selection.isSelected(row) || this.selection.selected.length > 1) {
                this.selection.clear();
                this.prevSelectedRows = [];
                this.prevSelectedRows.push(row);
            }

            this.selection.toggle(row);
        }

        // shift + click
        if ($event.shiftKey && !$event.ctrlKey && lastSelected && row !== lastSelected) {
            if (newPos - originalPos > 0) {
                this.dataSource.filteredData.forEach((data, index) => {
                    const currentRow = this.dataSource.filteredData[index];
                    if (!currentRow.isManaged) {
                        if ((index <= newPos && index > originalPos)
                            && !this.selection.isSelected(currentRow)) {
                            this.selection.toggle(currentRow);
                        } else {
                            if (this.selection.isSelected(currentRow)
                                && !(index <= newPos && index >= originalPos)) {
                                this.selection.toggle(currentRow);
                            }
                        }
                    }
                });
            } else {
                this.dataSource.filteredData.forEach((data, index) => {
                    const currentRow = this.dataSource.filteredData[index];
                    if (!currentRow.isManaged) {
                        if ((index < originalPos && index >= newPos)
                            && !this.selection.isSelected(currentRow)) {
                            this.selection.toggle(currentRow);
                        } else {
                            if (this.selection.isSelected(currentRow)
                                && !(index <= originalPos && index >= newPos)) {
                                this.selection.toggle(currentRow);
                            }
                        }
                    }
                });
            }
        }

        // ctrl + click
        if ($event.ctrlKey && !$event.shiftKey) {
            this.selection.toggle(row);
            this.prevSelectedRows.push(row);
        }

        // shift + ctrl + click
        if ($event.ctrlKey && $event.shiftKey) {
            if (newPos - originalPos > 0) {
                this.dataSource.filteredData.forEach((data, index) => {
                    const currentRow = this.dataSource.filteredData[index];
                    if (!currentRow.isManaged) {
                        if ((index <= newPos && index > originalPos)
                            && !this.selection.isSelected(currentRow)) {
                            this.selection.toggle(currentRow);
                        }
                    }
                });
            } else {
                this.dataSource.filteredData.forEach((data, index) => {
                    const currentRow = this.dataSource.filteredData[index];
                    if ((index < originalPos && index >= newPos && !currentRow.isManaged)
                        && !this.selection.isSelected(currentRow)) {
                        this.selection.toggle(currentRow);
                    }
                });
                for (let i = newPos; i <= originalPos; i++) {
                    if (!this.selection.isSelected(this.dataSource.filteredData[i])) {
                        this.selection.toggle(this.dataSource.filteredData[i]);
                    }
                }
            }
        }
    }

    /** Set up routine for localization */
    private initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        this.localizationSrv.localizeStringsAsync(tokens);
    }

    private setUpTable() {
        if (this.showManaged || this.totalCount - this.managedCount === 0) {
            this.dataSource = new MatTableDataSource(this.alarms);
        } else {
            this.dataSource = new MatTableDataSource(this.alarms.filter(x => !x.isManaged));
        }

        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'date':
                    return item.lastUpdateTime;
                default:
                    return item[property];
            }
        };
    }
}

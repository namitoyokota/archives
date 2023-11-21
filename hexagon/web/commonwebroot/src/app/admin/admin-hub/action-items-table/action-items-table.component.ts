import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { ActionItem } from '../admin-hub.component';
import { TableTranslationTokens } from './action-items-table.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-root-action-items-table',
    templateUrl: './action-items-table.component.html',
    styleUrls: ['./action-items-table.component.scss']
})
export class ActionItemsTableComponent implements OnInit {

    /** Table sort view child. */
    @ViewChild(MatSort, { static: false }) set content(sort: MatSort) {
        this.dataSource.sort = sort;
    }

    /** Action items for table. */
    @Input() data: ActionItem[] = [];

    /** Data source for table. */
    dataSource: MatTableDataSource<ActionItem> = new MatTableDataSource<ActionItem>();

    /** Columns displayed within table. */
    displayedColumns: string[] = ['name', 'expiration', 'priority'];

    /** Expose translation tokens to html template */
    tokens: typeof TableTranslationTokens = TableTranslationTokens;

    constructor(private router: Router) { }

    /** Function run on component initialization. */
    ngOnInit() {
        this.dataSource = new MatTableDataSource<ActionItem>(this.data);
    }

    /**
     * Navigate to correct admin page
     */
    goToAction(item: ActionItem) {
        this.router.navigateByUrl(item.link);
    }
}

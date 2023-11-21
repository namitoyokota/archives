import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Hyperlink$v1 } from '@galileo/web_common-libraries';

import { TranslationTokens } from './common-links.translate';

@Component({
    selector: 'hxgn-common-links',
    templateUrl: './common-links.component.html',
    styleUrls: ['./common-links.component.scss']
})
export class CommonLinksComponent implements AfterViewInit {

    /** List of hyperlinks */
    @Input('hyperlinks')
    set setHyperlinks(links: Hyperlink$v1[]) {
        this.hyperlinks = links;
        this.dataSource.data = this.hyperlinks;
    }

    /** Flag to indicate whether link can be removed */
    @Input() readonly = true;

    /** Emits when list of hyperlinks is updated */
    @Output() listChanged = new EventEmitter<Hyperlink$v1[]>();

    /** Sorting handler for table columns */
    @ViewChild(MatSort) sort: MatSort;

    /** List of hyperlinks to display */
    hyperlinks: Hyperlink$v1[];

    /** Data source for mat table */
    dataSource: MatTableDataSource<Hyperlink$v1> = new MatTableDataSource([]);

    /** Columns to display in table */
    readonly displayedColumns: string[] = ['text'];

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /** On init lifecycle hook */
    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    /** Removes link from list */
    remove(index: number) {
        this.hyperlinks.splice(index, 1);
        this.emit();
    }

    /** Emits event when the list gets updated */
    emit() {
        this.listChanged.emit(this.hyperlinks);
    }

    /** Opens clicked url in a new tab */
    openUrl(url: string) {
        window.open(url);
    }
}

import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PopoverPosition } from '../common-popover/common-popover.component';
import { CommonPropertiesTranslationTokens } from './common-properties.translate';

interface Property {
    /** Name */
    name: string;
    /** Details */
    details: string;
}

@Component({
    selector: 'hxgn-common-properties',
    templateUrl: 'common-properties.component.html',
    styleUrls: ['common-properties.component.scss']
})
export class CommonPropertiesComponent implements OnInit, OnChanges {

    /** Properties to display. */
    @Input() properties: Map<string, string>;

    /** Sorting handler for table columns. */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    /** Data source for mat table. */
    dataSource: MatTableDataSource<Property> = new MatTableDataSource([]);

    /** Columns to display in table. */
    displayedColumns: string[] = ['name', 'details'];

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Expose translation tokens to html. */
    tokens: typeof CommonPropertiesTranslationTokens = CommonPropertiesTranslationTokens;

    constructor() { }

    /** OnInit */
    ngOnInit() {
        this.dataSource.sort = this.sort;
    }

    /** OnInit */
    ngOnChanges(changes: SimpleChanges) {
        this.setUpTable();
    }


    /** Set up table values. */
    private setUpTable() {
        const properties: Property[] = [];
        if (this.properties.size) {
            this.properties.forEach((value, key) => {
                const property: Property = {
                    name: key,
                    details: value
                };
                properties.push(property);
            });
        }

        this.dataSource.data = properties;
    }
}

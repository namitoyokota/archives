import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommonPropertiesTranslationTokens } from './common-properties.translate';

interface Property {
    /** Name */
    name: string;

    /** Value */
    value: string;
}

@Component({
    selector: 'hxgn-common-properties',
    templateUrl: 'common-properties.component.html',
    styleUrls: ['common-properties.component.scss']
})

export class CommonPropertiesComponent implements OnInit {
    /** Properties to display. */
    @Input('properties')
    set setProperties(p: Record<string, string>) {
        this.setUpTable(p, this.showAll);
    }

    /** Sorting handler for table columns. */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    /** Data source for mat table. */
    dataSource: MatTableDataSource<Property> = new MatTableDataSource([]);

    /** Columns to display in table. */
    displayedColumns: string[] = ['name', 'details'];

    /** Expose CommonPropertiesTranslationTokens to HTML */
    tokens: typeof CommonPropertiesTranslationTokens = CommonPropertiesTranslationTokens;

    /** List of properties to show */
    propertyList: Property[] = [];

    /** Flag that is true if all properties should be shown */
    showAll = false;

    constructor() { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.dataSource.sort = this.sort;
    }

    /**
     * Toggle show all
     */
    toggleShowAll(): void {
        this.showAll = !this.showAll;
        if (this.showAll) {
            this.dataSource.data = this.propertyList;
        } else {
            this.dataSource.data = this.propertyList.slice(0, 3);
        }
    }

    /** Set up table values. */
    private setUpTable(propertyList: Record<string, string>, showAll = false) {
        const properties: Property[] = [];
        Object.entries(propertyList).forEach(([key, value]) => {
            const property: Property = {
                name: key,
                value: value
            };
            properties.push(property);
        });

        this.propertyList = properties;
        if (showAll) {
            this.dataSource.data = properties;
        } else {
            this.dataSource.data = properties.slice(0, 3);
        }
        
    }

}
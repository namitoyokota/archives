import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Types } from 'src/app/constants/types';

@Component({
    templateUrl: './type-filter.dialog.html',
    styleUrls: ['./type-filter.dialog.scss'],
})
export class TypeFilterDialogComponent implements OnInit {
    /** Selected types sent by the child */
    currentlySelected: string[] = [];

    /** List of types and its status */
    typeList = new Map<string, boolean>();

    constructor(private dialogRef: NbDialogRef<TypeFilterDialogComponent>) {
        Types.forEach((color) => this.typeList.set(color, true));
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        Types.forEach((type) => {
            this.typeList.set(type, this.currentlySelected.includes(type));
        });
    }

    /**
     * Toggles checkbox
     * @param type Type to select
     * @param checked Checkbox State
     */
    check(type: string, checked: boolean): void {
        this.typeList.set(type, checked);
    }

    /**
     * Returns selected type list
     */
    submit() {
        this.dialogRef.close(this.typeList);
    }

    /**
     * Close dialog without submitting
     */
    cancel() {
        this.dialogRef.close(false);
    }
}

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import {
    CommonUnsavedChangesDialogComponent,
    CommonUnsavedChangesDialogOptions,
    DirtyComponent$v1,
} from '@galileo/web_common-libraries';
import { from, of } from 'rxjs';
import { first, switchMap, take } from 'rxjs/operators';

@Injectable()
export class DirtyGuard$v1 implements CanDeactivate<DirtyComponent$v1> {

    /** Promise used to prevent the dialog from appearing twice. */
    confirmAsync: Promise<boolean>;

    constructor(private dialog: MatDialog) { }

    /**
     * Override for can deactivate.
     */
    canDeactivate(component: DirtyComponent$v1) {
        return component.isDirty$.pipe(switchMap(dirty => {
            if (!dirty) {
                return of(true);
            }

            if (!this.confirmAsync) {
                this.confirmAsync = new Promise<boolean>(resolve => {
                    setTimeout(async () => {
                        this.dialog.open(CommonUnsavedChangesDialogComponent, {
                            autoFocus: false,
                            disableClose: true,
                            data: {
                                disabledSave: component.disabledSave$ ? await component.disabledSave$.pipe(first()).toPromise() : false
                            }
                        }).afterClosed().subscribe(async (result) => {

                            if (result.selection === CommonUnsavedChangesDialogOptions.cancel) {
                                resolve(false);
                            } else if (result.selection === CommonUnsavedChangesDialogOptions.discardChanges) {
                                resolve(true);
                            } else {
                                await component.saveChangesAsync();
                                resolve(true);
                            }

                            // Wait for processing to happen before clearing out promise
                            setTimeout(() => {
                                this.confirmAsync = null;
                            });
                        });
                    });
                });
            }

            return from(this.confirmAsync);

        }), take(1));
    }
}

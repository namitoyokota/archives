import { Injectable, PACKAGE_ROOT_URL } from '@angular/core';
import { CommonmapAdminService } from '../admin.service';
import { ConfirmDiscardChangesDialogComponent } from './confirm-discard-changes-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class ConfirmDiscardChangesService {

    constructor(private mapAdminSvc: CommonmapAdminService,
        public dialog: MatDialog) { }

    checkForUnsaveChangesAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            if (this.mapAdminSvc.isDirty) {
                if (this.mapAdminSvc.selectedMapLayer) {
                    const dialogRef = this.dialog.open(ConfirmDiscardChangesDialogComponent, {
                        disableClose: true,
                        data: { type: 'layer' }
                    });

                    dialogRef.afterClosed().subscribe((val) => {
                        resolve(val);
                    });
                } else if (this.mapAdminSvc.selectedMapPreset) {
                    const dialogRef = this.dialog.open(ConfirmDiscardChangesDialogComponent, {
                        disableClose: true,
                        data: { type: 'preset' }
                    });

                    dialogRef.afterClosed().subscribe((val) => {
                        resolve(val);
                    });

                }
            } else {
                resolve(true);
            }
        });
    }
}

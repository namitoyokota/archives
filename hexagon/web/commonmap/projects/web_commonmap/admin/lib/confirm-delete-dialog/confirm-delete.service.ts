import { Injectable, PACKAGE_ROOT_URL } from '@angular/core';
import { CommonmapAdminService } from '../admin.service';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MapLayerType$v1 } from '@galileo/web_commonmap/_common';

@Injectable()
export class ConfirmDeleteService {

    constructor(private mapAdminSvc: CommonmapAdminService,
        public dialog: MatDialog) { }

    confirmDeleteAsync(layerType?: MapLayerType$v1): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            if (layerType) {
                const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
                    disableClose: true,
                    data: { type: layerType }
                });

                dialogRef.afterClosed().subscribe((val) => {
                    resolve(val);
                });
            } else {
                const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
                    disableClose: true,
                    data: { type: null }
                });

                dialogRef.afterClosed().subscribe((val) => {
                    resolve(val);
                });

            }
        });
    }
}

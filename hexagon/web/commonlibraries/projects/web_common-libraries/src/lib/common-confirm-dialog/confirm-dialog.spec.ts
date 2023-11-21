import { CommonConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';

describe('CommonConfirmDialogComponent', () => {
    let component: CommonConfirmDialogComponent;
    const mockLocalizationSrv = jasmine.createSpyObj(['localizeStringsAsync']);

    beforeEach(() => {
        const dialogRef: MatDialogRef<CommonConfirmDialogComponent> = null;
        const data: ConfirmDialogData = null;
        component = new CommonConfirmDialogComponent(dialogRef, data, mockLocalizationSrv);
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should action', () => {
        // Arrange
        spyOn((component as any), 'onAction');

        // Act
        component.onAction(true);

        // Assert
        expect((component as any).onAction).toHaveBeenCalled();
    });
});

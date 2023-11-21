import { CommonDatepickerComponent } from './common-datepicker.component';
import { MatDialogRef } from '@angular/material/dialog';

describe('CommonCalendarDialogComponent', () => {
    let component: CommonDatepickerComponent;
    beforeEach(() => {
        component = new CommonDatepickerComponent();
    });

    it('should create', () => {
        // Assert
        expect(component).toBeTruthy();
    });
});

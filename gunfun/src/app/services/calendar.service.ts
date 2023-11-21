import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CalendarService {
    /** Currently selected date */
    private selectedDate = new BehaviorSubject<Date>(new Date(new Date().toDateString()));

    /** Currently selected date */
    selectedDate$ = this.selectedDate.asObservable();

    constructor() {}

    /**
     * Updates selected date everywhere
     * @param date Date to update to
     */
    updateDate(date: Date): void {
        this.selectedDate.next(date);
    }
}

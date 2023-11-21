import { Component, Inject } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { Observable } from 'rxjs';

@Component({
    templateUrl: 'count.component.html'
})
export class CountInjectableComponent {

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public alarms$: Observable<Alarm$v1[]>) { }
}

import { Component, Inject } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS, Shape$v1 } from '@galileo/web_shapes/_common';
import { Observable } from 'rxjs';

@Component({
  templateUrl: 'count.component.html'
})
export class CountInjectableComponent {

  constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public shapes$: Observable<Shape$v1[]>) { }
}

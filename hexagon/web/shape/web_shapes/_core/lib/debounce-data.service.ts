import { Injectable } from '@angular/core';
import { DebounceDataService as DebounceService } from '@galileo/web_common-libraries';
import { ShapeChangeNotification$v1 } from '@galileo/web_shapes/_common';

@Injectable({providedIn: 'root'})
export class DebounceDataService extends DebounceService<ShapeChangeNotification$v1> {
  constructor() {
    super();
  }
}

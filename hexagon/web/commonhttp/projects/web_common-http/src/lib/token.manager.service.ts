import { Injectable } from '@angular/core';
import { TokenManager$v1 } from '@galileo/platform_common-http';

@Injectable({providedIn: 'root'})
export class TokenManagerService extends TokenManager$v1 {
  constructor() {
    super();
  }

}

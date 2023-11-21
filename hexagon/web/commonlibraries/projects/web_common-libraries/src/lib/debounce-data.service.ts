import { Injectable } from '@angular/core';
import { DebounceDataManager$v1 } from '@galileo/platform_common-libraries';

@Injectable()
export class DebounceDataService<T> extends DebounceDataManager$v1<T> {

    constructor() {
        super();
    }
    
}

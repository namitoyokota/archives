import { Store$v1 } from '@galileo/platform_common-libraries';

import { Application$v1 } from '../abstractions/application.v1';

export class ApplicationStore$v1 extends Store$v1<Application$v1> {
    constructor() {
        super('id', Application$v1);
    }
}

import { ProxyClass } from '@galileo/web_commonfeatureflags/adapter';

import { FeatureFlags } from './feature-flags';


/** This is the class that should be used when the RedText feature flag is on */
// tslint:disable-next-line: class-name
export class TestClass_redText {
    color: string;

    constructor() {
        this.color = 'Red';

        console.log('Text Proxy Class', this.color, this.getRGBColor());
    }

    private getRGBColor(): string {
        return '(252, 3, 3)';
    }
 }

/** This is the class that should be used when the RedText feature flag is off */
@ProxyClass(TestClass_redText, FeatureFlags.redText)
export class TestClass {
    color: string;

    constructor() {
        this.color = 'Blue';

        console.log('Test Class', this.color, this.getHexColor());
    }

    private getHexColor(): string {
        return '#0303fc';
    }
}

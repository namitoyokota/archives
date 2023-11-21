import { AlertTypes } from 'resources';

export class VMAlertDemoComponent {
    alertTypes: string[] = Object.values(AlertTypes);
    text = 'This is a sample alert';

    constructor() {}
}

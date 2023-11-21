import { VMButtonSizes, VMButtonTypes } from 'resources';

export class VMButtonDemoComponent {
    readonly vmButtonSizes: typeof VMButtonSizes = VMButtonSizes;
    readonly vmButtonTypes: typeof VMButtonTypes = VMButtonTypes;
    readonly buttonTypes: string[] = ['primary', 'secondary', 'approve', 'deny'];

    constructor() {}

    alert(): void {
        alert('button clicked!');
    }
}

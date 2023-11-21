export class VMSearchDemoComponent {
    autocompleteItems: string[] = ['Ben', 'Hunter', 'David', 'Jasper', 'Jasmine', 'Dave', 'Benjamin'];

    constructor() {}

    log($event: string): void {
        window.alert('searched: ' + $event);
    }
}

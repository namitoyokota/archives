import { Component, Inject } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS, NetworkListSettings$v1 } from '@galileo/web_commontenant/_common';

@Component({
    template: `<hxgn-commontenant-network-list
    (selectedNetworks)="setSelectedNetworks($event)"></hxgn-commontenant-network-list>`,
    styles: [
        `
            :host {
                width: 100%;
                height: 100%;
            }
        `
    ]
})
export class NetworkListInjectableComponent {
    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public settings: NetworkListSettings$v1
    ) { }

    /**
     * Sets the selected tenants
     * @param tenants Tenants that are selected
     */
    setSelectedNetworks(networks: string[]) {
        this.settings.setSelectedNetworks(networks);
    }
}

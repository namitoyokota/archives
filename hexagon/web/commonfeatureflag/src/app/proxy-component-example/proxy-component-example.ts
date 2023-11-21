import { Component, ComponentFactoryResolver, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { ProxyComponent } from '@galileo/web_commonfeatureflags/adapter';

import { FeatureFlags } from '../feature-flags';

// This is the proxy component
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'proxy-component-example',
    template: ``
})
// tslint:disable-next-line: class-name tslint:disable-next-line: component-class-suffix
export class ProxyExampleComponent_proxy extends ProxyComponent {
    constructor(
        viewContainerRef: ViewContainerRef,
        componentFactoryResolver: ComponentFactoryResolver,
        render: Renderer2
    ) {
        super(viewContainerRef, componentFactoryResolver, render,
            FeatureFlags.boldText, ProxyExampleComponent, ProxyExampleComponent_boldText);
    }
}

// This is the component that is shown when the flag is off
@Component({
    templateUrl: 'proxy-component-example.html'
})
export class ProxyExampleComponent implements OnInit {
    constructor() { }

    ngOnInit() {
        console.log('I am the Proxy Example Component');
    }
}

// This is the component that is shown when the flag is on
@Component({
    templateUrl: 'proxy-component-example_boldText.html'
})
// tslint:disable-next-line: class-name tslint:disable-next-line: component-class-suffix
export class ProxyExampleComponent_boldText implements OnInit {
    constructor() { }

    ngOnInit() {
        console.log('I am the Proxy Example Component Bold Text');
    }
}

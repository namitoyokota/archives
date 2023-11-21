import { AfterViewInit, ViewContainerRef, ComponentFactoryResolver, Type, Injector, Renderer2, ComponentRef, Directive } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { FeatureFlagRuntimeService } from './feature-flag-runtime.service';

@Directive() // Needed for base component classes
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class ProxyComponent implements AfterViewInit {

    private ffRuntime: FeatureFlagRuntimeService;

    private componentRef: ComponentRef<any>;

    private componentCreated = new BehaviorSubject<boolean>(false);

    constructor(
        private vcr: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private renderer: Renderer2,
        private flagId: string | string[],
        private currentType: Type<any>,
        private featureType: Type<any>
    ) {
        const injector = Injector.create({
            providers: [[FeatureFlagRuntimeService]]
        });

        this.ffRuntime = injector.get(FeatureFlagRuntimeService);
    }

    ngAfterViewInit(): void {

        const componentType = (this.ffRuntime.isActive(this.flagId)) ? this.featureType : this.currentType;

        const factory = this.cfr.resolveComponentFactory(componentType);
        this.componentRef = this.vcr.createComponent(factory);
        this.componentCreated.next(true);

        if (!!this.componentRef.instance.close) {
            this.componentRef.instance.close.subscribe(() => {
                this.vcr.clear();
            });
        }

        this.renderer.appendChild(
            this.vcr.element.nativeElement,
            this.componentRef.location.nativeElement
        );

    }

    /**
     * Passes an input/output down to the final component
     * @param propertyName Input name
     * @param value Input value
     */
    async createIOAsync<T>(propertyName: string, value: T): Promise<void> {
        await this.waitAsync();
        this.componentRef.instance[propertyName] = value;
    }

    /**
     * Waits for the component to be created
     */
    private waitAsync(): Promise<boolean> {
        return this.componentCreated.asObservable().pipe(
            filter(isReady => isReady),
            first()
        ).toPromise();
    }
}

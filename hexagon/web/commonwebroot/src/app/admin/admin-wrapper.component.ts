import { AfterViewInit, Component, ComponentRef, HostBinding, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DirtyComponent$v1, Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { Observable } from 'rxjs';
import { AdminService } from './admin.service';

@Component({
    template: `
        <div class="loading">
            <mat-spinner></mat-spinner>
        </div>
    `,
    styles: [`
    :host, .loading {
            display:flex;
            width: 100%;
            height: 100%;
    }

    .loading {
        justify-content: center;
        align-items: center;
    }
    `]
})

export class AdminWrapperComponent implements AfterViewInit, OnDestroy, DirtyComponent$v1 {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** Is dirty observable from child component. */
    isDirty$: Observable<boolean>;

    /** Option to disable save changes button in dialog. */
    disabledSave$?: Observable<boolean>;

    /** Ref to admin component */
    private componentRef: ComponentRef<DirtyComponent$v1>;

    constructor(
        private layoutAdapter: LayoutCompilerAdapterService,
        private route: ActivatedRoute,
        private adminService: AdminService) { }

    /**
     * After view init life cycle hook
     */
    ngAfterViewInit(): void {
        this.route.data.subscribe(async data => {
            const component = data?.adminComponent;
            const capabilityId = data?.adminId;
            const titleToken = data?.adminTitle;

            this.adminService.menuTitleToken = titleToken;

            // Load the admin code chunk
            await this.layoutAdapter.loadCapabilityCoreAsync(capabilityId);

            this.componentRef = await this.layoutAdapter.delegateInjectComponentPortalAsync(
                component, capabilityId, `#${this.componentId}`, null);

            if (this.componentRef.instance.isDirty$) {
                this.isDirty$ = this.componentRef.instance.isDirty$;
            }

            if (this.componentRef.instance.disabledSave$) {
                this.disabledSave$ = this.componentRef.instance.disabledSave$;
            }
        });
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    /**
     * Save changes override
     */
     async saveChangesAsync(): Promise<void> {
        await this.componentRef.instance.saveChangesAsync();
    }
}

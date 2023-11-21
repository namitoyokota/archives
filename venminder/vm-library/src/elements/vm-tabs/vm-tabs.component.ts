import { customElement, inject } from 'aurelia-framework';
import type { NavModel } from 'aurelia-router';
import { Router } from 'aurelia-router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@customElement('vm-tabs')
export class VMTabsComponent {
    /** List of nav items pulled from the router. */
    tabs: NavModel[] = [];

    private destroy$: Subject<void> = new Subject<void>();

    constructor(@inject(Router) private router: Router) {}

    /**
     * Attached life cycle hook.
     */
    attached(): void {
        this.tabs = this.router.navigation;

        this.tabs.forEach((nav: NavModel) => {
            if (nav.settings.badge?.count$) {
                nav.settings.badge?.count$.pipe(takeUntil(this.destroy$)).subscribe((count: number) => {
                    nav.settings.badge.count = count;
                });
            }

            if (nav.settings.icon?.show$) {
                nav.settings.icon?.show$.pipe(takeUntil(this.destroy$)).subscribe((value: boolean) => {
                    nav.settings.icon.show = value;
                });
            }
        });
    }

    /**
     * Detached life cycle hook.
     */
    detached(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}

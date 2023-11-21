import { ComponentRef } from '@angular/core';
import { Observable } from 'rxjs';

export class AppNotificationInjectionResponse$v1 {

    /** Color the notification should be. */
    color$?: Observable<string>;

    /** Title for the notification */
    title$?: Observable<string>;

    /** Reference to icon component */
    iconComponentRef: ComponentRef<any>;

    /** Reference to item component */
    itemComponentRef: ComponentRef<any>;

    constructor(params: AppNotificationInjectionResponse$v1 = {} as AppNotificationInjectionResponse$v1) {
        const {
            color$ = null,
            title$ = null,
            iconComponentRef = null,
            itemComponentRef = null
        } = params;

        this.color$ = color$;
        this.title$ = title$;
        this.iconComponentRef = iconComponentRef;
        this.itemComponentRef = itemComponentRef;
    }

}

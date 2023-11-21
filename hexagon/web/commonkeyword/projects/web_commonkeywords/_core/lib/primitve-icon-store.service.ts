import { Injectable } from '@angular/core';
import { PrimitiveIcon$v2 } from '@galileo/web_commonkeywords/_common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PrimitiveIconStoreService {

    private icons = new BehaviorSubject<Map<string, PrimitiveIcon$v2>>(new Map<string, PrimitiveIcon$v2>());

    constructor() { }

    /**
     * Inserts or updates an icon in the store
     * @param icon Icon to add or update in the store
     */
    upsert(icon: PrimitiveIcon$v2) {
        const iconMap = new Map<string, PrimitiveIcon$v2>(this.icons.getValue());
        iconMap.set(icon.id, new PrimitiveIcon$v2(icon));

        this.icons.next(iconMap);
    }

    /**
     * Adds list of icons to the store
     * @param icons Icons list to add to the store
     */
    concat(icons: PrimitiveIcon$v2[]) {
        icons.forEach(icon => {
            this.upsert(icon);
        });
    }

    /**
     * Gets an icon from the store
     * @param id Id of icon to get
     */
    get$(id: string): Observable<PrimitiveIcon$v2> {
        return this.icons.asObservable().pipe(
            map(icons => {
                return icons.get(id);
            })
        );
    }

    /**
     * Returns true if the given icon is part of the store
     * @param id Id of icon to check store for
     */
    has(id: string): boolean {
        return this.icons.getValue().has(id);
    }
}

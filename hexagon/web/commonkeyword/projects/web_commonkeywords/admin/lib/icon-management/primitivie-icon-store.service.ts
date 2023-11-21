import { Injectable } from '@angular/core';
import { PrimitiveIcon$v2 } from '@galileo/web_commonkeywords/_common';
import { DataService } from '@galileo/web_commonkeywords/_core';
import { zip } from 'rxjs';

@Injectable()
export class PrimitiveIconStoreService {

    /** List of primitive icons that can be used to create composite icons */
    private primitiveIconList: PrimitiveIcon$v2[] = [];

    constructor(
        private dataSrv: DataService
    ) { }

    /**
     * Load both system and user system defined primitive icons
     * @param capabilityId The capability to load icons for
     */
    load(capabilityId: string = null) {
        return new Promise<void>((resolve) => {
            // Wait for both icon calls to come back
            zip(
                this.dataSrv.primitiveIcon.getSystemDefinedByCapability$(capabilityId),
                this.dataSrv.primitiveIcon.getByCapability$(capabilityId)
            ).subscribe(([system, user]) => {
                this.concat(system.concat(user));
                resolve();
            });
        });
    }

    /**
     * Returns a copy of the primitive icons list
     */
    list(): PrimitiveIcon$v2[] {
        return [].concat(this.primitiveIconList);
    }

    /**
     * Returns primitive icon by id
     * @param id Primitive icon id
     */
    get(id: string): PrimitiveIcon$v2 {
        return this.primitiveIconList.find(icon => {
            return icon.id === id;
        });
    }

    /**
     * Inserts or updates an icon in the store
     * @param icon Icon to add or update in the store
     */
    upsert(icon: PrimitiveIcon$v2): void {
        let iconExists = this.primitiveIconList.some(i => i.id === icon.id);
        if (iconExists) {
            this.primitiveIconList.filter(i => i.id !== icon.id);
        } else {
            this.primitiveIconList = [...this.primitiveIconList, icon];
        }
    }

    /**
     * Adds list of icons to the store
     * @param icons Icons list to add to the store
     */
    concat(icons: PrimitiveIcon$v2[]): void {
        icons.forEach(icon => {
            this.upsert(icon);
        });
    }

    /**
     * Returns primitive icon by id
     * @param id Primitive icon id
     */
    remove(id: string): void {
        this.primitiveIconList = this.primitiveIconList.filter(icon => {
            return icon.id !== id
        });
    }

    /**
     * Clears the primitive icon store
     */
    clear(): void {
        this.primitiveIconList = [];
    }
}

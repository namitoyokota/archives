import { Injectable } from '@angular/core';
import { CompositeIcon$v1 } from '@galileo/web_commonkeywords/_common';
import { DataService } from '@galileo/web_commonkeywords/_core';

@Injectable()
export class CompositeIconService {

    /** Caches the composite icons */
    private cache: CompositeIcon$v1[] = [];
    private newIcons: string[] = [];

    constructor(
        private dataSrv: DataService
    ) { }

    /**
     * Returns composite icon by id
     * @param id Resource id of the composite icon
     */
    getAsync(id: string | string[]): Promise<CompositeIcon$v1 | CompositeIcon$v1[]> {
        return new Promise(async (resolve) => {
            // First check the cache
            const isArray = Array.isArray(id);
            if (!isArray) {
                id = [id as string];
            }

            let iconList: CompositeIcon$v1[] = [];
            for (const iconId of id) {
                const icon = this.cache.find(item => item.id === iconId);

                if (icon) {
                    iconList.push(icon);
                }
            }

            if (iconList.length !== id.length) {
                const missingList = (id as string[]).filter(i => !iconList.find(e => e === i));

                // Get from the database
                const missingIcons = await this.dataSrv.compositeIcon.get$(missingList).toPromise() as CompositeIcon$v1[];

                // Add to cache
                iconList = iconList.concat(missingIcons);

                missingIcons.forEach(item => {
                    this.cache.push(item);
                });
            }

            if (isArray) {
                resolve(iconList);
            } else {
                if (iconList.length) {
                    resolve(iconList[0]);
                } else {
                    resolve(null);
                }
            }

        });
    }

    /**
     * Returns icons that have not yet been saved
     */
    getNewIcons(): CompositeIcon$v1[] {
        return this.cache.filter(icon => {
            return !!this.newIcons.find(id => id === icon.id);
        }).map(icon => {
            return new CompositeIcon$v1(icon);
        });
    }

    /**
     * Clears the list of icons that have not been saved
     */
    clearNewIcons(): void {
        this.newIcons = [];
    }

    /**
     * Saves a new composite icon
     * @param icon The composite icon to save
     */
    addNew(icon: CompositeIcon$v1): void {
        this.cache.push(icon as CompositeIcon$v1);
        this.newIcons.push(icon.id);
    }

    updateAsync(icon: CompositeIcon$v1): Promise<CompositeIcon$v1> {
        return new Promise(async (resolve, reject) => {

            if (this.newIcons.find(id => id === icon.id)) {
                // Don't make rest call as this has not been saved yet
                const index = this.cache.findIndex(item => item.id === icon.id);
                this.cache[index] = new CompositeIcon$v1(icon);
                resolve(icon);
            } else {
                this.dataSrv.compositeIcon.update$(icon).toPromise().then((updatedIcon) => {
                    const index = this.cache.findIndex(item => item.id === icon.id);
                    this.cache[index] = new CompositeIcon$v1(updatedIcon);
                    resolve(updatedIcon);
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }
}

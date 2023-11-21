import type { IDataCache } from "shared-from-dcdev/shared/interfaces/data-cache-interface";
import { DataCacheOptions } from "shared-from-dcdev/shared/interfaces/data-cache-interface";
import { isNullOrUndefined } from "shared-from-dcdev/shared/utilities/globals";

export class DataCacheService implements IDataCache {
    protected cache: Map<string, CacheItem> = new Map<string, any>();
    protected expireItems(): any {
        let currTime = (new Date()).getTime();
        let itemsToDelete: string[] = [];
        this.cache.forEach((value, key) => {
            if (value.options.expirationMilliseconds >= 0 && value.absoluteExpiration.getTime() < currTime)
                itemsToDelete.push(key);
        });
        itemsToDelete.forEach(key => this.delete(key));
    }
    private slideExpiration(cacheItem: CacheItem) {
        if (cacheItem.options && cacheItem.options.isSlidingExpiration) {
            let currDate = new Date();
            cacheItem.absoluteExpiration = new Date(currDate.getTime() + cacheItem.options.expirationMilliseconds);
        }
    }
    private addItemToCache<T>(cacheId: string, getItemCallback: () => T, options: DataCacheOptions) {
        let data = getItemCallback();
        if (isNullOrUndefined(options))
            options = DataCacheOptions.Default;
        let currDate = new Date();
        let cacheItem = new CacheItem(data, options, new Date(currDate.getTime() + options.expirationMilliseconds));
        this.cache.set(cacheId, cacheItem);
        return cacheItem;
    }
    get<T>(cacheId: string, getItemCallback?: () => T, options?: DataCacheOptions): T {
        this.expireItems();

        let cacheItem = this.cache.get(cacheId);
        if (isNullOrUndefined(cacheItem)) {
            if (isNullOrUndefined(getItemCallback))
                return null;
            cacheItem = this.addItemToCache<T>(cacheId, getItemCallback, options);
        }

        this.slideExpiration(cacheItem);
        return <T>cacheItem.data;
    }
    replace<T>(cacheId: string, data: T, options?: DataCacheOptions): T {
        let cacheItem = this.cache.get(cacheId);
        if (!isNullOrUndefined(cacheItem)) {
            this.delete(cacheId);
            if(isNullOrUndefined(options))
                options = cacheItem.options;
        }
        return this.get(cacheId, () => data, options);
    }
    delete(cacheId: string) {
        this.cache.delete(cacheId);
    }
    clear() {
        this.cache.clear();
    }
}

class CacheItem {
    constructor(public data: any, public options: DataCacheOptions, public absoluteExpiration: Date) { }
}

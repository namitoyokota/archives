export class DataCacheOptions {
    public static NeverExpires = new DataCacheOptions(-1, false);
    public static Default = new DataCacheOptions(15000, true);
    public static FiveSecondsSliding = new DataCacheOptions(1000 * 5, true);
    public static OneMinuteSliding = new DataCacheOptions(1000 * 60, true);
    public static FiveMinutesSliding = new DataCacheOptions(1000 * 60 * 5, true);
    public static TenMinutesSliding = new DataCacheOptions(1000 * 60 * 10, true);
    public static FiveSecondsNotSliding = new DataCacheOptions(5000, false);

    constructor(public expirationMilliseconds: number, public isSlidingExpiration: boolean) { }
}

export interface IDataCache {
    get<T>(cacheId: string, getItemCallback?: () => T, options?: DataCacheOptions): T;
    replace<T>(cacheId: string, data: T, options?: DataCacheOptions): T;
    delete(cacheId: string);
    clear();
}
/**
 * Represents a current expiry time interval
 */
export class MediaExpiryTime$v1 {

    /** Time till media expires. In milliseconds */
    expiryTime: number;

    /** List of media ids attached to the expiry time */
    ids: string[];

    /** Friendly DateTime of when the interval is supposed to run. Only used for debugging purposes. */
    intervalTime: string;

    constructor(params: MediaExpiryTime$v1 = {} as MediaExpiryTime$v1) {
        const {
            expiryTime = null,
            ids = null,
            intervalTime = null
        } = params;

        this.expiryTime = expiryTime;
        this.ids = ids;
        this.intervalTime = intervalTime;
    }
}

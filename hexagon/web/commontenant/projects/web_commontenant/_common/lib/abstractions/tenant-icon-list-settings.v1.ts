import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class TenantIconListSettings$v1 {

    /** Notification for when urlList changes */
    private urlList = new BehaviorSubject<string[]>(null);

    /** Notification for when maxIcons changes */
    private maxIcons = new BehaviorSubject<number>(4);

    /** Observable for the url list. */
    readonly urlList$ = this.urlList.asObservable().pipe(
        filter(value => !!value)
    );

    /** Observable for max icons. */
    readonly maxIcons$ = this.maxIcons.asObservable().pipe(
        filter(value => !!value)
    );

    constructor() { }

    /**
    * Set the url list
    * @param urlList the list of urls
    */
    setUrlList(urlList: string[]) {
        this.urlList.next(urlList);
    }

    /**
   * Set the max icons allowed
   * @param customValues Custom values
   */
    setMaxIcons(maxIcons: number) {
        this.maxIcons.next(maxIcons);
    }
}

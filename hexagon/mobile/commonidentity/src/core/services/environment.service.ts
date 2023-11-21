import { BehaviorSubject } from 'rxjs';

import { filter } from 'rxjs/operators'
import { capabilityId } from '../../common';
import { PersistentStorage$v1 } from '@galileo/mobile_commonlibraries';

export class EnvironmentService {

  /** Key used to check storage for base url */
  private readonly storageKey = `${capabilityId}/baseURL/v1`

  /** The base url of the application */
  private baseURL = new BehaviorSubject<string>('');

  /** The base url of the application */
  baseURL$ = this.baseURL.asObservable().pipe(
    filter(url => !!url)
  );

  constructor() {
    try {
      PersistentStorage$v1.get<string>(this.storageKey).then(baseURL => {
        if (!baseURL) {
          console.log('Base URL not found');
        } else {
          console.log('Base URL found');
          this.setBaseURL(baseURL);
        }
      });
    } catch(ex) {}
  }

  /**
   * Sets the base url
   * @param url Base URL
   */
  setBaseURL(url: string): void {
    this.baseURL.next(url);

    try {
      PersistentStorage$v1.set<string>(this.storageKey, url);
    } catch(ex) {}
  }

  /**
   * Get the current value of base url
   */
  snapShotBaseURL(): string {
    return this.baseURL.getValue();
  }
}

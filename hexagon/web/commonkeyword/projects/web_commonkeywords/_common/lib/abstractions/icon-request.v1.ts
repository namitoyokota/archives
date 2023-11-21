import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { CompositeIconRequest$v1 } from './composite-icon-request.v1';

export class IconRequest$v1 {
  /** Composite icon that is being requested */
  icon$ = new BehaviorSubject<CompositeIconRequest$v1>(null);

  /** The size the icons should be */
  size$ = new BehaviorSubject<number>(null);

  /** Heading string of the dropdown menu */
  title$ = new BehaviorSubject<string>('');

  /** Subtitle string of the dropdown menu */
  subtitle$ = new BehaviorSubject<string>('');

  /** Keywords used for the search */
  keywords$ = new BehaviorSubject<string[]>([]);

  /** Whether icon can be edited or not */
  editable$ = new BehaviorSubject<boolean>(false);

  /** Subject to store keywords update */
  private keywordsChange: Subject<string[]> = new Subject<string[]>();

  /** Notification for when keywords need update */
  readonly keywordsChange$: Observable<string[]> = this.keywordsChange.asObservable();

  /** Change to icon required keywords update */
  updateKeywords(keywords: string[]): void {
    this.keywordsChange.next(keywords);
  }
}

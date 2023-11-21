import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, Subject } from 'rxjs';

import { CompositeIconRequest$v1 } from '../abstractions/composite-icon-request.v1';
import { CompositeIcon$v1 } from '../abstractions/composite-icon.v1';
import { PrimitiveIcon$v2 } from '../abstractions/primitive-icon.v2';
import { CompositeIconFromKeywordsRequest } from './composite-icon-from-keywords-request.v1.interface';



export class Mailbox$v1 {

    /** Flag that is true when the core is loaded */
    coreIsLoaded$ = new BehaviorSubject<boolean>(false);

    /** Event bus for request to get composite icons from keywords */
    getCompositeIconFromKeywords$ = new Subject<MailBox<CompositeIconFromKeywordsRequest, CompositeIcon$v1>>();

    /** Event bus for request to load composite icons */
    loadCompositeIcons$ = new Subject<CompositeIconRequest$v1[]>();

    /** Event bus for request to get primitive icons. (icon id, primitiveIcon) */
    getPrimitiveIcon$ = new Subject<MailBox<string, PrimitiveIcon$v2>>();
}

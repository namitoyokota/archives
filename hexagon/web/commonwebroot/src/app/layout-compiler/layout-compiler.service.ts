import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class LayoutCompilerService {

    /** Event that is fired when the selected workspace changes */
    workspaceChange$ = new BehaviorSubject<string>(null);

    /** When true multi-screen workspaces will span new tabs */
    openWorkspaceScreens = true;

    constructor() { }
}

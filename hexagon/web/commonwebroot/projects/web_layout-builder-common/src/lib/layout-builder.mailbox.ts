import { Injectable } from '@angular/core';
import * as LayoutAdapter from '@galileo/web_commonlayoutmanager/adapter';
import { Subject } from 'rxjs';

export interface SelectedNestedView {
    /** The layout adapter view */
    view: LayoutAdapter.View$v1;
    /** The index of the view */
    index: number;
}

@Injectable({
  providedIn: 'root'
})
export class MailboxService {

    /** Get view by block id for mailbox service. */
    getViewByBlockId: Subject<LayoutAdapter.MailBox<string, LayoutAdapter.View$v1>> =
        new Subject<LayoutAdapter.MailBox<string, LayoutAdapter.View$v1>>();

    /** Update view by block id for mailbox service. */
    updateViewByBlockId: Subject<LayoutAdapter.MailBox<string, void>> =
        new Subject<LayoutAdapter.MailBox<string, void>>();

    /** Set selected nested view for mailbox service. */
    setSelectedNestedView: Subject<LayoutAdapter.MailBox<SelectedNestedView, void>> =
        new Subject<LayoutAdapter.MailBox<SelectedNestedView, void>>();

    /** Get selected workspace for mailbox service. */
    getSelectedWorkspace: Subject<LayoutAdapter.MailBox<void, LayoutAdapter.Workspace$v1>> =
        new Subject<LayoutAdapter.MailBox<void, LayoutAdapter.Workspace$v1>>();

    /** Get relative selected cell resolution for mailbox service. */
    getRelativeSelectedCellResolution: Subject<LayoutAdapter.MailBox<void, any>> =
        new Subject<LayoutAdapter.MailBox<void, any>>();
}

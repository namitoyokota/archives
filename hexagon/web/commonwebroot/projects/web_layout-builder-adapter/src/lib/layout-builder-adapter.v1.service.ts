import { Injectable } from '@angular/core';
import * as BuilderCommon from '@galileo/web_layoutbuilder-common';
 import * as LayoutAdapter from '@galileo/web_commonlayoutmanager/adapter';

@Injectable({
  providedIn: 'root'
})
export class LayoutBuilderAdapterService$v1 {

    constructor(private mailBoxService: BuilderCommon.MailboxService) { }

    /**
     * Returns the view that is in the block by id.
     * @param blockId  The id of the block to get the view for.
     */
    getViewByBlockIdAsync(blockId: string): Promise<LayoutAdapter.View$v1> {
        return new Promise<LayoutAdapter.View$v1>((resolve) => {

            const mailBox = new LayoutAdapter.MailBox<string, LayoutAdapter.View$v1>(blockId);
            // Listen for response in the mailbox
            mailBox.response.subscribe((view) => {
                resolve(view);
                mailBox.close();
            });

            this.mailBoxService.getViewByBlockId.next(mailBox);
        });
    }

    /**
     * Event to the layout builder to mark a view as being modified.
     * NOTE: This is used for views that can have child views.
     * @param blockId The block id the view is living in.
     */
    updateViewByBlockIdAsync(blockId: string): Promise<void> {
        return new Promise<void>((resolve) => {

            const mailBox = new LayoutAdapter.MailBox<string, void>(blockId);

            // Listen for response in the mailbox
            mailBox.response.subscribe(() => {
                resolve();
                mailBox.close();
            });

            this.mailBoxService.updateViewByBlockId.next(mailBox);
        });
    }

    /**
     * Sets the currently selected nested view.
     * NOTE: This is used for views that can have child views.
     * @param selectedNestedView The nested view that is to be selected
     */
    setSelectedNestedViewAsync(selectedNestedView: BuilderCommon.SelectedNestedView): Promise<void> {
        return new Promise<void>((resolve) => {

            const mailBox = new LayoutAdapter.MailBox<BuilderCommon.SelectedNestedView, void>(selectedNestedView);

            // Listen for response in the mailbox
            mailBox.response.subscribe(() => {
                resolve();
                mailBox.close();
            });

            this.mailBoxService.setSelectedNestedView.next(mailBox);
        });
    }

    /**
     * Returns the currently selected workspace.
     */
    getSelectedWorkspace(): Promise<LayoutAdapter.Workspace$v1> {
        return new Promise<LayoutAdapter.Workspace$v1>((resolve) => {
            const mailBox = new LayoutAdapter.MailBox<void, LayoutAdapter.Workspace$v1>();

            // Listen for response in the mailbox
            mailBox.response.subscribe((workspace) => {
                resolve(workspace);
                mailBox.close();
            });

            this.mailBoxService.getSelectedWorkspace.next(mailBox);
        });
    }

    /**
     * Returns the resolution of the selected cell relative to the selected workspace in pixels.
     */
    getRelativeSelectedCellResolution(): Promise<any> {
        return new Promise<LayoutAdapter.Workspace$v1>((resolve) => {
            const mailBox = new LayoutAdapter.MailBox<void, any>();

            // Listen for response in the mailbox
            mailBox.response.subscribe((workspace) => {
                resolve(workspace);
                mailBox.close();
            });

            this.mailBoxService.getRelativeSelectedCellResolution.next(mailBox);
        });
    }
}

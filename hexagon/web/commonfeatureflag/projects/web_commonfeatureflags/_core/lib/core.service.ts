import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonWindowCommunicationService, WindowMessage } from '@galileo/web_common-http';
import { AddFeedbackMessage$v1, capabilityId, CommonMailboxService } from '@galileo/web_commonfeatureflags/_common';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { LayoutCompilerAdapterService, MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { filter } from 'rxjs/operators';

import { DataService$v2 } from './data.service.v2';
import { EventService } from './event.service';
import { FeatureFlagChangeNotification$v1, NotificationService } from './notification.service';
import { RefreshDialogComponent } from './share/refresh-dialog/refresh-dialog.component';

@Injectable()
/**
 * The core service is the place where you tie all your other service
 * together. It should not be provided to any component or service. This
 * is where you will set up the listeners to the common mailbox, and
 * set up converting notifications into events.
 */
export class CoreService {

    private readonly refreshMsgId = '@hxgn/commonfeatureflag/refresh';
    private readonly cancelRefreshDialogId = '@hxgn/commonfeatureflag/refresh/cancel';

    private refreshDialogRef: MatDialogRef<RefreshDialogComponent>;

    constructor(
        private mailbox: CommonMailboxService,
        private eventSrv: EventService,
        private layoutAdapter: LayoutCompilerAdapterService,
        private dialog: MatDialog,
        private windowSrv: CommonWindowCommunicationService,
        private notificationSrv: NotificationService,
        private dataSrv: DataService$v2,
        private identityAdapter: CommonidentityAdapterService$v1
    ) {
        this.initListenerForNotifications();
        this.initListenerForRefreshEvent();
        this.initListenerForCancelRefreshEvent();
        this.initPostOffice();
        this.mailbox.mailbox$v1.coreIsLoaded$.next(true);
        this.layoutAdapter.coreIsLoadedAsync(capabilityId);

        this.initListenerEnabledFeatureFlagChange();
    }

    /**
     * Shows the refresh dialog. This dialog lets the user know that experimental features has changed.
     */
    private showRefreshDialog() {
        if (!this.refreshDialogRef) {
            // Show refresh dialog
            this.refreshDialogRef = this.dialog.open(RefreshDialogComponent, {
                disableClose: true,
                autoFocus: false
            });

            this.refreshDialogRef.afterClosed().subscribe(reload => {
                if (reload) {
                    if (this.windowSrv.isChildWindow()) {
                        this.windowSrv.messageMaster({
                            contextId: this.refreshMsgId
                        } as WindowMessage<void>);
                    } else {
                        location.reload();
                    }
                } else {

                    if (this.windowSrv.isChildWindow()) {
                        this.windowSrv.messageMaster({
                            contextId: this.cancelRefreshDialogId
                        } as WindowMessage<void>);
                    } else {
                        this.windowSrv.getHandleIds().forEach(id => {
                            this.windowSrv.messageWindow({
                                handleId: id,
                                contextId: this.cancelRefreshDialogId
                            } as WindowMessage<void>);
                        });
                    }
                }

                this.refreshDialogRef = null;
            });
        }
    }

    /**
     * Listen for the refresh required window event
     */
    private initListenerForRefreshEvent() {
        if (!this.windowSrv.isChildWindow()) {
            this.windowSrv.receiveMessage$.pipe(
                filter(msg => {
                    return msg.contextId === this.refreshMsgId;
                })
            ).subscribe(msg => {
                location.reload();
            });
        }
    }

    /**
     * Listen for cancel refresh refresh window event
     */
    private initListenerForCancelRefreshEvent() {
        this.windowSrv.receiveMessage$.pipe(
            filter(msg => {
                return msg.contextId === this.cancelRefreshDialogId;
            })
        ).subscribe( () => {
            if (this.refreshDialogRef) {
                this.refreshDialogRef.close();

                if (!this.windowSrv.isChildWindow()) {
                    this.windowSrv.getHandleIds().forEach(id => {
                        this.windowSrv.messageWindow({
                            handleId: id,
                            contextId: this.cancelRefreshDialogId
                        } as WindowMessage<void>);
                    });
                }
            }
        });
    }

    /**
     * Listen for the refresh required event.
     */
    private initListenerEnabledFeatureFlagChange() {
        this.eventSrv.enabledFeatureFlagsChanged$.subscribe(() => {
            this.showRefreshDialog();
        });
    }

    private initListenerForNotifications() {
        this.notificationSrv.updated$.subscribe((msg: FeatureFlagChangeNotification$v1) => {
            // Check that the user is part of the group.
            if (msg.groupId && msg.groupId !== '*') {
                this.identityAdapter.getUserInfoAsync().then(user => {
                    if (user.group.some(g => g === msg.groupId)) {
                        this.eventSrv.enabledFeatureFlagChanged();
                    }
                });
            } else {
                this.eventSrv.enabledFeatureFlagChanged();
            }
        });
    }

    /**
     * Listen to all messages in the mailbox service
     */
    private initPostOffice(): void {
        this.initListenerForSaveFeedbackMessage();
    }

    private initListenerForSaveFeedbackMessage(): void {
        this.mailbox.mailbox$v1.saveFeedbackMessage$.subscribe(async (request: MailBox<AddFeedbackMessage$v1, void>) => {
            const result = await this.dataSrv.feedbackMessage.createFeedback$(request.payload).toPromise();
            request.response.next();
        });
    }
}

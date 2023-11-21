import { inject } from 'aurelia-framework';
import { Subscription, EventAggregator } from 'aurelia-event-aggregator';
import { OverlayManagerEvents } from './constants/overlay-manager-constants';
import type { ICallbackEventArgs } from './interfaces/overlay-manager-interfaces';
import { wait } from 'shared-from-dcdev/shared/utilities/globals';


export class OverlayManager {
    fadeoutTimer = 360;
    overlays: Array<ICallbackEventArgs> = [];
    startingZIndex: number = 30000;

    constructor(
        @inject(EventAggregator) private ea: EventAggregator
    ) { }

    onCloseAllOverlaysSubscriber: Subscription | undefined;
    onCloseLastOverlaySubscriber: Subscription | undefined;
    onCloseOverlaySubscriber: Subscription | undefined;
    onCreateOverlaySubscriber: Subscription | undefined;

    //-- Lifecycle Events **************************
    attached() {
        this.onCreateOverlaySubscriber = this.ea.subscribe(OverlayManagerEvents.ON_CREATE_OVERLAY, async (eventArgs: ICallbackEventArgs) => {
            let controlId = eventArgs.ControlID + 'overlay' + (this.overlays.length + 1);

            const timer = (eventArgs.SmokeBackground) ? this.fadeoutTimer : 0;

            this.overlays.push({
                ActionNeeded: eventArgs.ActionNeeded,
                BgClass: ((eventArgs.SmokeBackground) ? 'overlay-boxify-bg' : ''),
                ControlID: controlId,
                OnOverlayClose: eventArgs.OnOverlayClose,
                SmokeBackground: eventArgs.SmokeBackground,
                ZIndex: this.startingZIndex + this.overlays.length + 1
            });

            await wait(10);

            const el = document.querySelector('.overlay-boxify' + controlId);
            el.classList.add(((eventArgs.SmokeBackground) ? 'fadein' : 'open'));

            await wait(timer);

            if (eventArgs.OnOverlayOpen) {
                eventArgs.OnOverlayOpen(controlId);
            }
        });

        this.onCloseOverlaySubscriber = this.ea.subscribe(OverlayManagerEvents.ON_CLOSE_OVERLAY, (eventArgs: ICallbackEventArgs) => {
            this.closeOverlay(eventArgs);
        });

        this.onCloseAllOverlaysSubscriber = this.ea.subscribe(OverlayManagerEvents.ON_CLOSE_ALL_OVERLAYS, () => {
            this.overlays.forEach((layout) => {
                this.closeOverlay({
                    ControlID: layout.ControlID
                });
            });
        });

        this.onCloseLastOverlaySubscriber = this.ea.subscribe(OverlayManagerEvents.ON_CLOSE_LAST_OVERLAY, () => {
            let controlId = this.overlays[this.overlays.length - 1].ControlID;

            this.closeOverlay({
                ControlID: controlId
            });
        });
    }

    detached() {
        if (this.onCloseAllOverlaysSubscriber != undefined) {
            this.onCloseAllOverlaysSubscriber.dispose();
        }

        if (this.onCloseLastOverlaySubscriber != undefined) {
            this.onCloseLastOverlaySubscriber.dispose();
        }

        if (this.onCloseOverlaySubscriber != undefined) {
            this.onCloseOverlaySubscriber.dispose();
        }

        if (this.onCreateOverlaySubscriber != undefined) {
            this.onCreateOverlaySubscriber.dispose();
        }
    }
    //-- *******************************************

    private async closeOverlay(eventArgs: ICallbackEventArgs): Promise<void> {
        const indexToRemove = this.overlays.findIndex(o => o.ControlID == eventArgs.ControlID);

        if (indexToRemove == -1) {
            return;
        }

        const overlay = this.overlays[indexToRemove];

        if (eventArgs.FromOverlayClick && overlay.ActionNeeded) {
            return;
        }

        //-- If defined, the Popup control will receive this callback.
        if (overlay.OnOverlayClose) {
            overlay.OnOverlayClose(eventArgs);
        }

        const el = document.querySelector('.overlay-boxify' + eventArgs.ControlID);
        el.classList.remove((overlay.SmokeBackground ? 'fadein' : 'open'));

        const closeTimer = (overlay.SmokeBackground) ? this.fadeoutTimer : 0;

        await wait(closeTimer);

        this.overlays.splice(indexToRemove, 1);
    }

    private closeOverlayFromClick(controlId: string): void {
        this.closeOverlay({
            ControlID: controlId,
            FromOverlayClick: true
        });
    }
}

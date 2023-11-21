import { inject } from 'aurelia-framework';
import { Subscription, EventAggregator } from 'aurelia-event-aggregator';
import { wait } from 'shared-from-dcdev/shared/utilities/globals';
import gsap from 'gsap';
import { IVmPopupEventArgs, IVmPopupToggleModel } from './vm-popup-interfaces';
import { VmPopupEvents } from './vm-popup-constants';
import { ICallbackEventArgs } from '../../../shared/components/overlay-manager/interfaces/overlay-manager-interfaces';
import { OverlayManagerEvents } from '../../../shared/components/overlay-manager/constants/overlay-manager-constants';


export class VmPopup {
    callback: any = null;
    containerHeight: number = 0;

    isInView: boolean = false;

    offsetLeft = 5;

    popupContainer: HTMLElement | undefined;
    popupTimer: number = .25;

    toggleModel: IVmPopupToggleModel | undefined;

    viewModel: IVmPopupEventArgs | undefined;

    onHidePopupSubscriber: Subscription | undefined;
    onShowPopupSubscriber: Subscription | undefined;

    constructor(
        @inject(EventAggregator) private ea: EventAggregator
    ) { }

    attached() {
        window.addEventListener("scroll", () => {
            this.checkResizeOrScroll(false);
        });

        window.addEventListener("resize", () => {
            this.checkResizeOrScroll();
        });

        this.onHidePopupSubscriber = this.ea.subscribe(VmPopupEvents.ON_HIDE_POPUP, () => {
            if (this.isInView) {
                this.hidePopup();
            }
        });

        this.onShowPopupSubscriber = this.ea.subscribe(VmPopupEvents.ON_SHOW_POPUP, async (viewModel: IVmPopupEventArgs) => {
            this.callback = viewModel.Callback;

            /**
             * We're receiving these callbacks from the control that was composed.
             * OnLoaded, OnUpdated, OnClose
             */
            viewModel.Model.OnLoaded = () => {
                const offsetPosition = this.getOffsetElementPosition();

                this.toggleModel = {
                    ContainerWidth: this.viewModel.Model.ContainerWidth,
                    ContainerHeight: this.viewModel.Model.ContainerHeight,
                    Left: offsetPosition.Left,
                    Top: offsetPosition.Top,
                    ScreenHeight: window.innerHeight,
                    ScrollTop: window.scrollY,
                    ScreenWidth: window.innerWidth,
                    ScrollLeft: window.scrollX,
                    IsShow: true
                };

                this.ea.publish('onCreateOverlay', <ICallbackEventArgs>{
                    ActionNeeded: this.viewModel.Model.ActionNeeded,
                    ControlID: this.viewModel.Model.ControlID,
                    OnOverlayOpen: (newControlId: string) => {
                        this.viewModel.Model.ControlID = newControlId;
                        this.togglePopup(this.toggleModel);
                    },
                    OnOverlayClose: (args: ICallbackEventArgs) => {
                        if (this.callback) {
                            this.callback(args);
                        }

                        this.togglePopup({
                            TransitionWithNoDuration: args.FromOverlayClick,
                            ContainerHeight: this.containerHeight,
                            IsShow: false
                        });
                    },
                    SmokeBackground: this.viewModel.Model.SmokeBackground
                });
            }

            viewModel.Model.OnClose = (data) => {
                this.ea.publish(OverlayManagerEvents.ON_CLOSE_OVERLAY, <ICallbackEventArgs>{
                    ControlID: viewModel.Model.ControlID,
                    Data: data
                });
            }

            this.viewModel = null;

            await wait(0);

            this.viewModel = viewModel;
        });
    }

    close() {
        this.viewModel.Model.OnClose();
    }

    save() {
        //-- OnSave is implemented in the composed controls base class
        if (this.viewModel.Model.OnSave) {
            this.viewModel.Model.OnSave({ onClose: this.viewModel.Model.OnClose })
        }
    }


    detached() {
        if (this.onHidePopupSubscriber != undefined) {
            this.onHidePopupSubscriber.dispose();
        }

        if (this.onShowPopupSubscriber != undefined) {
            this.onShowPopupSubscriber.dispose();
        }
    }

    checkResizeOrScroll(isResize: boolean = true): void {
        if (this.isInView) {
            this.hidePopup();
        }
    }

    getOffsetElementPosition(fromResizeOrScroll: boolean = false) {
        let left = this.viewModel.Model.Left;
        let top = this.viewModel.Model.Top;

        const toggleModel = this.toggleModel;

        if (fromResizeOrScroll) {
            /**
             * Check to see if the positioning of the container will be out of view. If so, adjust so that's 
             * its fully in view.
             */
            if (((top - window.scrollY) + toggleModel.ContainerHeight) > window.innerHeight) {
                top -= ((top + toggleModel.ContainerHeight) - (window.innerHeight + window.scrollY));
            }

            if (((left - window.scrollX) + toggleModel.ContainerWidth) > window.innerWidth) {
                left -= (((left + toggleModel.ContainerWidth) - (window.innerWidth + window.scrollX)) + this.offsetLeft);
            }
        }

        return {
            Top: top,
            Left: left
        };
    }

    hidePopup(): void {
        this.ea.publish(OverlayManagerEvents.ON_CLOSE_OVERLAY, <ICallbackEventArgs>{
            ControlID: this.viewModel.Model.ControlID
        });

        this.togglePopup({
            TransitionWithNoDuration: true,
            ContainerHeight: this.containerHeight,
            IsShow: false
        });
    }

    togglePopup(model: IVmPopupToggleModel): void {
        this.isInView = model.IsShow;

        const opacity = (this.isInView) ? 1 : 0;
        let timer = (model.TransitionWithNoDuration) ? 0 : this.popupTimer;

        if (opacity) {
            let y = model.Top;
            let x = model.Left;

            gsap.set(this.popupContainer, { visibility: 'visible', width: model.ContainerWidth, height: model.ContainerHeight });

            /**
             * Check to see if the positioning of the container will be out of view. If so, adjust so that's 
             * its fully in view.
             */
            if (((y - model.ScrollTop) + model.ContainerHeight) > model.ScreenHeight) {
                y -= ((y + model.ContainerHeight) - (model.ScreenHeight + model.ScrollTop));
            }

            if (((x - model.ScrollLeft) + model.ContainerWidth) > model.ScreenWidth) {
                x -= (((x + model.ContainerWidth) - (model.ScreenWidth + model.ScrollLeft)) + this.offsetLeft);
            }

            gsap.set(this.popupContainer, { translateX: x, translateY: y });
        }
        else {
            model.ContainerHeight = 0;
            //-- Speed up the hiding of the popup just a tad.
            timer -= .075;
        }

        gsap.to(this.popupContainer, {
            duration: timer, opacity: opacity, onComplete: () => {
                if (!this.isInView) {
                    this.popupContainer.style.visibility = 'hidden';
                }
            }
        });
    }
}

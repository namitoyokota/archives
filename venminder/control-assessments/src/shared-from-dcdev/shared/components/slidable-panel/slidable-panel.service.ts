import { BehaviorSubject, Observable } from "rxjs";
import type { IPanelSubtitle } from "./panel-interfaces";

export interface PanelState {
    component?: string,
    content: any,
    open?: boolean,
    source?: any,
    title?: string,
    subTitles?: Array<IPanelSubtitle>,
    closed?(data): void,
    opened?(): void,
    render?: Function
}

export const initialPanelState = {
    component: '',
    content: null,
    open: false,
    source: null,
    title: '',
    subTitles: [],
    closed: null,
    opened: null
}

export class SlidablePanelService {
    private panelState = new BehaviorSubject<PanelState>(initialPanelState)
    
    delayTimer = 310;

    onclose: any;

    getPanelState(): Observable<PanelState> {
        return this.panelState
    }

    open(state: PanelState): void {
        this.panelState.next({
            ...initialPanelState,
            open: true,
            ...state
        })
    }

    close(state = initialPanelState): void {
        setTimeout(() => {
            this.panelState.next({
                ...state,
                open: false
            });
        }, this.delayTimer);
    }
}
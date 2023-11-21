import { Component, Input, EventEmitter, Output } from '@angular/core';
import { LayerOpacityTranslationTokens } from './layer-opacity.translation';

@Component({
    selector: 'hxgn-commonmap-layer-opacity',
    templateUrl: './layer-opacity.component.html',
    styleUrls: ['./layer-opacity.component.scss']
})
export class LayerOpacityComponent {
    @Input() opacity = 0;

    @Output() opacityChanged: EventEmitter<number> = new EventEmitter<number>();

    /**  Expose translation tokens to html template */
    tokens: typeof LayerOpacityTranslationTokens = LayerOpacityTranslationTokens;

    constructor() { }

    getDisplayOpacity(): number {
        const value: number = Math.floor(this.opacity * 100);
        return (value);
    }

    getDisplayOpacityLabel(): string {
        const opacityLabel: string = (this.getDisplayOpacity()).toString() + '%';
        return (opacityLabel);
    }

    setOpacity(event: any) {
        this.opacity = event.value / 100;
        this.opacityChanged.next(this.opacity);
    }
}

import { Component, Input, ViewChild } from '@angular/core';
import { IFrameHtmlFormatTranslationTokens } from './iframe-html-host.translation';

@Component({
    selector: 'hxgn-commonmap-iframe-html-host',
    templateUrl: './iframe-html-host.component.html',
    styleUrls: ['./iframe-html-host.component.scss']
})
export class IFrameHtmlHostComponent  {
    @ViewChild('htmlIframe') iframeHost;

    @Input('htmlString') set htmlString(value: string) {
        this._htmlString = value;
        setTimeout(() => this.fillIFrame(), 100);
    }

    @Input('refresh') set refresh(value: boolean) {
        if (value) {
            setTimeout(() => this.fillIFrame(), 100);
        }
    }
    _htmlString: string;

    /**  Expose translation tokens to html template */
    tokens: typeof IFrameHtmlFormatTranslationTokens = IFrameHtmlFormatTranslationTokens;

    constructor() { }

    fillIFrame() {
        if (this.iframeHost?.nativeElement?.contentWindow?.document && this._htmlString) {
            const html = decodeURI(this._htmlString);
            this.iframeHost.nativeElement.contentWindow.document.open();
            this.iframeHost.nativeElement.contentWindow.document.write(html);
            this.iframeHost.nativeElement.contentWindow.document.close(); 
        }
    }

}
